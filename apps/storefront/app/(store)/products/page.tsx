import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Boxes, Globe2, BadgeCheck, ShieldCheck, PackageCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORY_META } from '@/lib/categories';
import { Catalogue } from '@/components/storefront/catalogue';
import { ProductScroller } from '@/components/storefront/product-scroller';
import type { Category } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Products | Tomah International',
  description: 'Poultry, pork, meats, seafood, grains and vegetables — sourced globally and supplied wholesale by the case. Request a quote by category.',
};

const HUB_CATEGORIES: Category[] = ['POULTRY', 'PORK', 'MEATS', 'SEAFOOD', 'GRAINS', 'VEGETABLES_AND_FRIES'];

const HUB_IMAGES: Partial<Record<Category, { url: string; alt: string }>> = {
  POULTRY: { url: '/images/category-poultry.jpg', alt: 'Whole chicken and cut poultry portions styled with herbs' },
  PORK: { url: '/images/category-pork.jpg', alt: 'Pork loin, chops and ribs on a wooden board with herbs' },
  MEATS: { url: '/images/category-meats.jpg', alt: 'Beef, pork and chicken arranged on a dark studio backdrop with herbs' },
  SEAFOOD: { url: '/images/category-seafood.jpg', alt: 'Salmon, shrimp, lobster and shellfish on ice with lemon' },
  GRAINS: { url: '/images/category-grains.jpg', alt: 'Bags and bowls of rice, corn, oats and grains' },
  VEGETABLES_AND_FRIES: { url: '/images/category-vegetables-fries.jpg', alt: 'Fresh vegetables beside bowls of golden fries' },
};

const steps = [
  ['01', 'Tell us what you need', 'Share your product, volume and destination requirements.'],
  ['02', 'We source and confirm', 'Our team aligns supply, specifications and commercial terms.'],
  ['03', 'We coordinate delivery', 'From documentation to shipment, we keep the process moving.'],
];

export default async function ProductsHub({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const hasQuery = Boolean(sp.q?.trim());
  const data = hasQuery
    ? await api.listProducts({ q: sp.q, sort: sp.sort, page: Number(sp.page) || 1 })
    : null;

  return (
    <main id="main" className="store-main store-main--flush">
      <section className="hub-hero">
        <div className="shell hub-hero-grid">
          <div>
            <p className="store-kicker light">Wholesale product range</p>
            <h1>Quality food, sourced globally. Supplied by the case.</h1>
            <p>
              Every category below is sold wholesale — pricing is prepared through an individual
              quote based on product, volume, specification and destination. Looking for maple
              syrup instead? <Link href="/maple-shop">Visit the maple shop →</Link>
            </p>
          </div>
          <Link className="store-button gold" href="/quote">
            Request a wholesale quote <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <div className="shell">
        {data ? (
          <Catalogue data={data} query={sp.q} sort={sp.sort} />
        ) : (
          <ProductScroller>
            {HUB_CATEGORIES.map((id) => {
              const meta = CATEGORY_META[id];
              const image = HUB_IMAGES[id];
              const Icon = meta.icon;
              return (
                <Link className={`hub-slide ${!image ? 'hub-slide--fallback' : ''}`} href={`/categories/${id}`} key={id}>
                  {image ? (
                    <>
                      <Image className="hub-slide-image" src={image.url} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 1200px" />
                      <div className="hub-slide-scrim" aria-hidden />
                    </>
                  ) : (
                    <Icon className="hub-slide-icon" aria-hidden />
                  )}
                  <div className="hub-slide-content">
                    <h2>{meta.label}</h2>
                    <p>{meta.heroBlurb}</p>
                    <span className="hub-tile-link">Browse &amp; request quote <ArrowRight size={15} /></span>
                  </div>
                </Link>
              );
            })}
          </ProductScroller>
        )}
      </div>

      <section className="values section shell">
        <div className="values-visual">
          <div className="stat-card"><Globe2 size={31} strokeWidth={1.5} /><strong>Global reach</strong><span>Supplying customers and markets worldwide</span></div>
          <div className="quality-card"><BadgeCheck size={26} /><span>Quality-led sourcing</span></div>
        </div>
        <div className="values-copy">
          <p className="eyebrow">Why Tomah</p>
          <h2>International capability. Personal commitment.</h2>
          <p>We build lasting relationships with producers, suppliers, distributors and customers. Every enquiry is handled with the integrity, reliability and care that dependable trade requires.</p>
          <ul>
            <li><ShieldCheck /> Reputable global supplier network</li>
            <li><Boxes /> Wholesale fulfilment by the case</li>
            <li><PackageCheck /> Clear coordination from order to delivery</li>
          </ul>
        </div>
      </section>

      <section className="process section" id="how-it-works">
        <div className="shell">
          <p className="eyebrow light">A clear path to supply</p>
          <div className="process-heading"><h2>Trade made straightforward.</h2><p>Our team keeps you informed from the first conversation through to delivery.</p></div>
          <div className="steps">{steps.map(([number, title, body]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div>
      </section>

      <section className="quote section shell">
        <div><p className="eyebrow light">Let&rsquo;s talk supply</p><h2>Looking for a reliable food supply partner?</h2></div>
        <div><p>Tell us what you need and where it needs to go. Our team will help you take the next step.</p><Link className="button button-gold" href="/quote">Start your enquiry <ArrowRight size={18} /></Link></div>
      </section>
    </main>
  );
}
