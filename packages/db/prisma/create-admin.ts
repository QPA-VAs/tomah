/**
 * Create (or update) a single real ADMIN user — for production, where you
 * don't want the full demo seed (fake customers/products/orders).
 *
 * Usage (from repo root):
 *   DATABASE_URL="..." npx tsx packages/db/prisma/create-admin.ts \
 *     --email you@example.com --name "Your Name" --password 'a-strong-password'
 *
 * Idempotent: re-running with the same email updates name/role/password
 * instead of creating a duplicate.
 */
import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import argon2 from "argon2";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const email = arg("email");
  const name = arg("name");
  const password = arg("password");
  if (!email || !name || !password) {
    console.error("Usage: --email <email> --name <name> --password <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const passwordHash = await argon2.hash(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: UserRole.ADMIN, isActive: true, passwordHash },
    create: { email, name, role: UserRole.ADMIN, passwordHash },
  });
  console.log(`✓ ADMIN user ready: ${user.email} (id ${user.id})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
