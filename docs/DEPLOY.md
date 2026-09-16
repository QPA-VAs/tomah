# Deploying Tomah (Vercel + Supabase)

This monorepo hosts three deployables, all served under **one domain** —
`tomah.vercel.app` (or your custom domain once you attach one to the
`tomah` project) — via three Vercel projects wired together with rewrites:

| App               | Path              | What it is                     | Vercel project | Serves at                          |
| ----------------- | ----------------- | ------------------------------- | --------------- | ----------------------------------- |
| Storefront        | `apps/storefront` | Customer site (Next.js)         | `tomah`          | `tomah.vercel.app/` (owns the domain) |
| Admin dashboard   | `apps/web`         | React + Vite SPA                | `tomah-admin`    | `tomah.vercel.app/admin/*` (proxied) |
| Admin API         | `apps/api`         | Express REST API, one serverless fn | `tomah-api`   | `tomah.vercel.app/api/*`, `/uploads/*` (proxied) |

The `tomah` project (storefront) is the **primary** project — it owns the
domain and reverse-proxies `/admin/*` to `tomah-admin` and `/api/*` +
`/uploads/*` to `tomah-api` (see `apps/storefront/next.config.ts`
`rewrites()`). The browser only ever talks to one origin; the other two
projects' own `*.vercel.app` URLs stay reachable directly too (useful for
debugging), but end users only ever see the primary domain.

`packages/db` is the **shared** Prisma schema + client — one Supabase
database backs everything. Run migrations from **one** place and coordinate
schema changes with anyone else touching the storefront or API.

> **Deploy order matters.** `tomah-api` and `tomah-admin` must exist (and be
> reachable) *before* the first `tomah` (storefront) deploy, because some
> storefront pages fetch data from the live API at **build time** (static
> generation). Deploy `tomah-api` → `tomah-admin` → `tomah`, in that order.

---

## 1. Supabase

1. **Create a project.** Save the database password, project ref (`<ref>`), and region.
2. **Connection strings** — use the *Connect* dialog (Project Settings → Database, or the "Connect" button in the dashboard header):
   - **Transaction pooler** (port `6543`) → this is `DATABASE_URL`.
     Append `?pgbouncer=true&connection_limit=1`.
   - **Session pooler** (port `5432`, host `*.pooler.supabase.com`) → this is
     `DIRECT_URL` (used only by `prisma migrate`). **Do not** use the plain
     "Direct connection" string (`db.<ref>.supabase.co:5432`) for this — that
     host is IPv6-only and Vercel's build containers have no IPv6 egress, so
     `prisma migrate deploy` fails there with `P1001: Can't reach database
     server`. The session pooler is IPv4-compatible and behaves like a direct
     connection for migrations (unlike the transaction pooler).
3. **Storage** — Storage → New bucket → name `product-images` → **Public bucket: ON**.
4. **API credentials** — Project Settings → API:
   - *Project URL* → `SUPABASE_URL`
   - *`service_role` secret* → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never
     exposed to the browser; the admin API uses it to write to the bucket).

## 2. Apply the schema + seed (once)

From a machine with the repo checked out. Point `packages/db/.env` at Supabase
(`DATABASE_URL` = pooler, `DIRECT_URL` = direct), then:

```bash
npm install
npm run db:migrate:deploy   # applies packages/db/prisma/migrations to Supabase
npm run db:seed             # OPTIONAL — staff users + demo catalogue/orders
```

The API build also runs `prisma migrate deploy` on every deploy (see §3), so
step 2's migrate is optional if you deploy the API first. **Seeding is always
manual.** If you seed, immediately change the demo passwords (`Tomah!2026`)
or create real ADMIN users and delete the demo ones.

## 3. Vercel project `tomah-api`

- **New Project → import `QPA-VAs/tomah`.**
- **Root Directory:** `apps/api` — tick *“Include source files outside of the
  Root Directory”* (monorepo install needs the repo root).
- **Framework preset:** Other. Build/install commands are already defined in
  `apps/api/vercel.json` (installs from the repo root, generates the Prisma
  client, runs `prisma migrate deploy`, compiles the API).
- **Node.js version:** 20.x.
- **Environment variables** (Production + Preview):

  | Var | Value |
  | --- | --- |
  | `NODE_ENV` | `production` |
  | `DATABASE_URL` | Supabase **transaction pooler** URL (port 6543) + `?pgbouncer=true&connection_limit=1` |
  | `DIRECT_URL` | Supabase **session pooler** URL (port 5432, `*.pooler.supabase.com` — not `db.<ref>.supabase.co`, see §1) |
  | `JWT_ACCESS_SECRET` | 48+ random bytes (`node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`) |
  | `JWT_REFRESH_SECRET` | another 48+ random bytes |
  | `ACCESS_TOKEN_TTL` | `15m` |
  | `REFRESH_TOKEN_TTL_DAYS` | `30` |
  | `COOKIE_DOMAIN` | *(empty)* — host-only cookie, correct for the single-domain proxy setup |
  | `COOKIE_SECURE` | `true` |
  | `COOKIE_SAMESITE` | `lax` |
  | `CORS_ORIGINS` | `https://tomah.vercel.app` (or your custom domain) |
  | `STORAGE_ADAPTER` | `supabase` |
  | `SUPABASE_URL` | `https://<ref>.supabase.co` |
  | `SUPABASE_SERVICE_ROLE_KEY` | service-role secret |
  | `SUPABASE_STORAGE_BUCKET` | `product-images` |
  | `PAYMENT_PROVIDER` | `manual` (no online collection) or `stripe` |
  | `STRIPE_SECRET_KEY` | required if `PAYMENT_PROVIDER=stripe` |
  | `STRIPE_PUBLISHABLE_KEY` | required if `PAYMENT_PROVIDER=stripe` (safe to expose to the browser) |
  | `STRIPE_WEBHOOK_SECRET` | required if `PAYMENT_PROVIDER=stripe` — from the Stripe Dashboard webhook endpoint pointed at `/api/v1/public/payments/stripe/webhook` |
  | `ACCOUNTING_ADAPTER` | `noop` |
  | `INVOICE_DUE_DAYS` | `14` |

  Stripe's **automatic payment methods** surface Apple Pay and Google Pay on
  the storefront's Payment Element automatically — enable them (and add/verify
  your domain) in the Stripe Dashboard under Settings → Payment methods; no
  extra backend config.

- **Deploy**, then give it a stable alias (e.g. `tomah-api.vercel.app`).
- **Smoke test:**
  - `GET https://tomah-api.vercel.app/api/v1/healthz` → `{"status":"ok",…}`
  - `GET https://tomah-api.vercel.app/api/v1/readyz` → `{"status":"ready"}` (proves the DB connection)

## 4. Vercel project `tomah-admin` (dashboard)

- Import the **same repo**. **Root Directory:** `apps/web` (include outside files).
- **Framework preset:** Vite.
- **Before the first deploy:** edit `apps/web/vercel.json` and replace both
  `https://YOUR-API-DEPLOYMENT.vercel.app` occurrences with the real API alias
  from §3, then commit/push.
- **Environment variables:** none required (`VITE_API_BASE_URL` defaults to
  `/api/v1`, which the rewrite in `vercel.json` proxies to the API).
- **Deploy**, then give it a stable alias (e.g. `tomah-admin.vercel.app`).
- The app is built with `base: "/admin/"` and `<BrowserRouter basename="/admin">`
  (see `apps/web/vite.config.ts`, `apps/web/src/App.tsx`) so it works correctly
  both standalone (`tomah-admin.vercel.app` redirects `/` → `/admin`) and
  proxied under the storefront's domain (§6).

## 5. Vercel project `tomah` (storefront — owns the domain)

- Import the **same repo**. **Root Directory:** `apps/storefront`. It is *not*
  an npm workspace member — it has its own `package.json`/lockfile, so no
  "include outside files" toggle is needed.
- **Framework preset:** Next.js (auto-detected).
- **Node.js version:** 20.x.
- **Environment variables:**

  | Var | Value |
  | --- | --- |
  | `TOMAH_API_MODE` | `live` |
  | `TOMAH_API_BASE_URL` | `https://tomah-api.vercel.app/api/v1` (real alias from §3, **including `/api/v1`**) |
  | `TOMAH_PUBLIC_SITE_URL` | `https://tomah.vercel.app` (or your custom domain) |
  | `TOMAH_ADMIN_ORIGIN` | only set if `tomah-admin`'s alias differs from the `https://tomah-admin.vercel.app` default baked into `next.config.ts` |
  | `TOMAH_API_ORIGIN` | only set if `tomah-api`'s alias differs from the `https://tomah-api.vercel.app` default |

- **Deploy**, then set this project's alias/domain to the one you want
  customers to use (e.g. `tomah.vercel.app`, or a custom domain).
- **Smoke test:** open the domain root (storefront home page), then
  `/admin` (should reach the admin login screen), then sign in and confirm
  the network tab shows `/api/v1/auth/login` succeeding against the same
  origin.

## 6. How the pieces talk to each other

- **Storefront → API (server-side).** `apps/storefront/app/api/storefront/public/[...path]/route.ts`
  forwards requests to `TOMAH_API_BASE_URL` directly, server-to-server. Not
  affected by any rewrite.
- **Browser → admin dashboard.** The browser requests `tomah.vercel.app/admin/*`;
  the `tomah` project's `next.config.ts` rewrite proxies that (transparently,
  URL bar unchanged) to `tomah-admin`'s own `/admin/*`.
- **Browser → API, from the admin dashboard.** The dashboard's JS calls
  root-relative `/api/v1/...` and `/uploads/...`. Since the browser is on
  `tomah.vercel.app`, those requests hit the `tomah` project too, which
  proxies them to `tomah-api`. This makes the refresh-token cookie
  first-party to `tomah.vercel.app` — keep `COOKIE_SAMESITE=lax` and
  `COOKIE_DOMAIN` empty.

## 7. Push-to-deploy: what to enable

- **Vercel.** Nothing extra beyond importing each of the 3 projects via
  *Add New → Project → Import Git Repository* in the Vercel dashboard — that
  flow installs Vercel's GitHub App on the repo and wires up Git integration
  automatically. After that, every push to `main` auto-deploys to
  Production for the project(s) whose Root Directory contains changed files,
  and every other branch/PR gets its own Preview Deployment. Check each
  project's **Settings → Git → Production Branch** is `main`.
- **Supabase.** There is no separate Supabase↔GitHub integration to enable in
  this setup — schema changes ship as Prisma migrations committed to
  `packages/db/prisma/migrations`, and `apps/api/vercel.json`'s
  `buildCommand` runs `prisma migrate deploy` against Supabase on **every**
  `tomah-api` deploy. Push a migration → push to `main` → `tomah-api`
  redeploys → migration applies automatically.

## 8. Post-deploy checklist

- [ ] `tomah-api.vercel.app/api/v1/healthz` and `/readyz` green.
- [ ] `tomah.vercel.app/admin` reaches the login screen; signing in shows
      `POST /api/v1/auth/login` setting the `tomah_rt` cookie, and a later
      `POST /api/v1/auth/refresh` 200.
- [ ] Create a product and upload an image — confirm the image URL points at
      `…supabase.co/storage/v1/object/public/product-images/…` and renders
      both in the admin dashboard and on the storefront.
- [ ] Replace demo staff accounts with real ones.
- [ ] Attach a custom domain to the `tomah` project if you have one; update
      `TOMAH_PUBLIC_SITE_URL` and `CORS_ORIGINS` to match.

## 9. Known MVP limitations

- Cold starts of ~1–2 s on the first API request after idle.
- No background jobs / cron. Derived states (`OVERDUE`, `EXPIRED`) are computed
  on read, so this is fine.
- `prisma migrate deploy` runs inside the API build. To gate migrations, drop it
  from `apps/api/vercel.json` `buildCommand` and run `npm run db:migrate:deploy`
  by hand.
- Real accounting sync is still a stub (`ACCOUNTING_ADAPTER=noop`). Stripe
  collection is fully wired (`PAYMENT_PROVIDER=stripe`); `manual` stays
  available as a no-account fallback.
- Storefront pages that fetch data at build time need `tomah-api` reachable
  during the `tomah` project's build — see the deploy-order note at the top.

## 10. Local development — admin (API + dashboard)

```bash
docker compose up -d db
npm install
cp .env.example .env
cp packages/db/.env.example packages/db/.env
cp apps/api/.env.example    apps/api/.env
cp apps/web/.env.example    apps/web/.env
npm run db:migrate
npm run db:seed
npm run dev            # API on :4000, dashboard on :5173/admin
```

The dashboard now serves under `/admin` locally too (matching production) —
open `http://localhost:5173/admin`.

With `apps/api/.env` left at its default `PAYMENT_PROVIDER=manual`, checkout
works with zero external accounts — the storefront's "Simulate payment
success (dev only)" button calls `POST /public/checkout/:ref/confirm-dev`.

### Testing the real Stripe flow locally

1. Create a free [Stripe](https://dashboard.stripe.com/register) account — test
   mode needs no business verification. Grab the test **Secret key** and
   **Publishable key** (Dashboard → Developers → API keys).
2. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) and run
   `stripe login` once.
3. In `apps/api/.env`:
   ```
   PAYMENT_PROVIDER=stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...   # printed by `stripe listen` below — paste it in and restart the API
   ```
4. In a separate terminal, forward webhooks to the local API:
   ```bash
   stripe listen --forward-to localhost:4000/api/v1/public/payments/stripe/webhook
   ```
   (It prints a `whsec_...` the first time — that's `STRIPE_WEBHOOK_SECRET`.)
5. Restart `npm run dev`. Checkout now returns a real `clientSecret`; the
   storefront's Payment Element takes a [test card](https://docs.stripe.com/testing)
   (`4242 4242 4242 4242`, any future date/CVC). Apple Pay / Google Pay only
   render on a supporting browser/device over HTTPS — they won't appear on
   plain `http://localhost`.

## 11. Local development — storefront

The storefront is a standard Next.js app and is not an npm workspace member,
so it gets its own install:

```bash
cd apps/storefront
npm install
cp .env.example .env
```

Edit `apps/storefront/.env` to point at the local admin API:

```
TOMAH_API_MODE=live
TOMAH_API_BASE_URL=http://localhost:4000/api/v1
TOMAH_PUBLIC_SITE_URL=http://localhost:3000
```

Then, with the admin API running (§10):

```bash
npm run dev
```

Open `http://localhost:3000` — browse `/products` (seeded catalogue), add the
maple syrup to cart, and check out. Leave `TOMAH_API_MODE=mock` (the default)
to run the storefront standalone against its built-in fixtures instead, with
no API required.
