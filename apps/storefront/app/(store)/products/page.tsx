import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORY_META } from '@/lib/categories';
import { Catalogue } from '@/components/storefront/catalogue';
import type { Category } from '@/lib/api/types';

const site = process.env.TOMAH_PUBLIC_SITE_URL || 'https://tomah.vercel.app';

export const metadata: Metadata = {
  title: 'Wholesale Food Products | Tomah International',
  description: 'Tomah International is a wholesale food distributor supplying poultry, pork, meats, seafood, grains and vegetables to customers and markets worldwide. Request a quote by category.',
  alternates: { canonical: `${site}/products` },
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
      {/* ---------------------------- compact wholesale hero ---------------------------- */}
      <section className="wholesale-banner">
        <div className="shell wholesale-banner-grid">
          <div className="wholesale-banner-copy">
            <p className="wholesale-banner-eyebrow">Wholesale Food Supply</p>
            <h1>Quality Food Products.<br />Global Supply.</h1>
            <p>Explore Tomah&rsquo;s range of frozen and dry food products supplied to customers and markets worldwide.</p>
            <div className="wholesale-banner-actions">
              <Link className="button button-gold" href="/quote">Request a Quote <ArrowRight size={17} /></Link>
              <Link className="button button-outline-light" href="/contact">Contact Tomah</Link>
            </div>
          </div>
          <div className="wholesale-banner-media">
            <Image src="/images/tomah-global-food-sourcing.png" alt="Poultry, seafood, grains and vegetables crated for wholesale shipment at a loading dock" fill sizes="(max-width: 900px) 90vw, 520px" style={{ objectFit: 'cover' }} priority />
          </div>
        </div>
      </section>

      <div className="shell">
        {data ? (
          <div className="wholesale-search-results">
            <Catalogue data={data} query={sp.q} sort={sp.sort} />
          </div>
        ) : (
          <>
            {/* ------------------------- product category directory ------------------------- */}
            <section className="wholesale-directory" aria-labelledby="wholesale-directory-heading">
              <h2 id="wholesale-directory-heading" className="sr-only">Wholesale product categories</h2>
              <div className="wholesale-directory-grid">
                {HUB_CATEGORIES.map((id) => {
                  const meta = CATEGORY_META[id];
                  const image = HUB_IMAGES[id];
                  return (
                    <Link className="wholesale-card" href={`/categories/${id}`} key={id}>
                      <div className="wholesale-card-media">
                        {image && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 850px) 100vw, 50vw" style={{ objectFit: 'cover' }} />}
                        <span className="wholesale-card-badge">Wholesale</span>
                      </div>
                      <div className="wholesale-card-body">
                        <h3>{meta.label}</h3>
                        <p>{meta.heroBlurb}</p>
                        <span className="wholesale-card-link">Explore Products <ChevronRight size={16} /></span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* ------------------------------ wholesale cta ----------------------------------- */}
            <section className="wholesale-cta">
              <div>
                <p className="eyebrow light">Let&rsquo;s talk supply</p>
                <h2>Looking for a Reliable Food Supply Partner?</h2>
                <p>Tell us what you need and our team will help you with product availability, specifications and wholesale quotations.</p>
              </div>
              <div className="wholesale-cta-actions">
                <Link className="button button-gold" href="/quote">Request a Wholesale Quote <ArrowRight size={18} /></Link>
                <Link className="button button-outline-light" href="/contact">Contact Tomah</Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
