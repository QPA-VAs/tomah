import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Leaf, ShoppingCart, Truck } from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORY_META } from '@/lib/categories';
import { MapleShopCatalogue, type MapleTypeFilter } from '@/components/storefront/maple-shop-catalogue';
import type { ProductSummary } from '@/lib/api/types';

const site = process.env.TOMAH_PUBLIC_SITE_URL || 'https://tomah.vercel.app';
const PAGE_SIZE = 9;

// The maple catalogue is small and stable — these three product lines are the
// only ones the business sells retail. Sidebar labels come from this list,
// but a type only renders (and only counts) if a matching product is
// actually present in the fetched catalogue.
const MAPLE_TYPES: { slug: string; label: string }[] = [
  { slug: 'maple-syrup', label: 'Maple Syrup' },
  { slug: 'maple-sugar', label: 'Maple Sugar' },
  { slug: 'maple-butter', label: 'Maple Butter' },
];

export const metadata: Metadata = {
  title: 'Maple Products | Tomah International',
  description: 'Organic maple syrup, sugar and butter — order online, no minimums, ships direct.',
  alternates: { canonical: `${site}/maple-shop` },
};

const matchesStock = (p: ProductSummary, stock: string[]) =>
  stock.length === 0 || stock.includes(p.inStock ? 'in' : 'coming');

export default async function MapleShop({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; type?: string; stock?: string | string[]; page?: string }>;
}) {
  const sp = await searchParams;
  const stock = sp.stock ? (Array.isArray(sp.stock) ? sp.stock : [sp.stock]) : [];
  const page = Math.max(1, Number(sp.page) || 1);

  // Fetch the full maple catalogue (search + sort handled by the real API);
  // type/availability/pagination are applied here since they aren't native
  // catalogue-service query params.
  const data = await api.listProducts({ category: 'MAPLE_PRODUCTS', q: sp.q, sort: sp.sort, pageSize: 48 });
  const searched = data.items;

  const types: MapleTypeFilter[] = MAPLE_TYPES
    .filter((t) => searched.some((p) => p.slug === t.slug))
    .map((t) => ({ ...t, count: searched.filter((p) => p.slug === t.slug && matchesStock(p, stock)).length }));

  const byType = sp.type ? searched.filter((p) => p.slug === sp.type) : searched;
  const stockCounts = {
    inStock: byType.filter((p) => p.inStock).length,
    comingSoon: byType.filter((p) => !p.inStock).length,
  };

  const filtered = byType.filter((p) => matchesStock(p, stock));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const products = await Promise.all(pageItems.map((p) => api.getProduct(p.slug)));

  const meta = CATEGORY_META.MAPLE_PRODUCTS;

  return (
    <main id="main" className="store-main store-main--flush">
      {/* ------------------------- compact maple shop banner ------------------------- */}
      <section className="maple-banner">
        <div className="shell maple-banner-grid">
          <div className="maple-banner-copy">
            <p className="maple-banner-crumb"><Link href="/">Home</Link> / <span>Maple Shop</span></p>
            <h1>{meta.label}</h1>
            <p>{meta.heroBlurb}</p>
            <div className="maple-banner-trust">
              <span><Leaf size={18} /><span><b>100% Organic</b>Pure &amp; Natural</span></span>
              <span><Truck size={18} /><span><b>Ships Worldwide</b>Direct to Your Door</span></span>
              <span><ShoppingCart size={18} /><span><b>No Minimum Order</b>Shop with Confidence</span></span>
            </div>
          </div>
          <div className="maple-banner-media">
            <Image src="/images/maple-syrup-bottle-cutout.png" alt="Tomah pure maple syrup bottle" fill sizes="(max-width: 900px) 60vw, 420px" style={{ objectFit: 'contain' }} priority />
          </div>
        </div>
      </section>

      {/* ------------------------------ shop catalogue -------------------------------- */}
      <div className="shell">
        <MapleShopCatalogue
          products={products}
          total={searched.length}
          totalMatching={filtered.length}
          types={types}
          stockCounts={stockCounts}
          page={page}
          pageSize={PAGE_SIZE}
        />
      </div>
    </main>
  );
}
