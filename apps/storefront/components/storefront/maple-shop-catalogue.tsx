'use client';

import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import type { ProductDetail } from '@/lib/api/types';
import { MapleProductCard } from './maple-product-card';

export type MapleTypeFilter = { slug: string; label: string; count: number };

export function MapleShopCatalogue({
  products,
  total,
  totalMatching,
  types,
  stockCounts,
  page,
  pageSize,
}: {
  products: ProductDetail[];
  total: number;
  totalMatching: number;
  types: MapleTypeFilter[];
  stockCounts: { inStock: number; comingSoon: number };
  page: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const activeType = searchParams.get('type') ?? '';
  const activeSort = searchParams.get('sort') ?? '';
  const activeStock = searchParams.getAll('stock');

  const pushParams = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(searchParams.toString());
    mutate(next);
    router.push(`/maple-shop${next.toString() ? `?${next}` : ''}`, { scroll: false });
  };

  const toggleStock = (value: string) => {
    pushParams((p) => {
      const current = p.getAll('stock');
      p.delete('stock');
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      next.forEach((v) => p.append('stock', v));
    });
  };

  const Sidebar = (
    <>
      <div className="maple-filter-group">
        <h2>Shop by Category</h2>
        <nav aria-label="Maple product categories">
          <button type="button" className={`maple-filter-link ${!activeType ? 'active' : ''}`} onClick={() => pushParams((p) => p.delete('type'))}>
            All Maple Products <span>({total})</span>
          </button>
          {types.map((t) => (
            <button
              type="button"
              key={t.slug}
              className={`maple-filter-link ${activeType === t.slug ? 'active' : ''}`}
              onClick={() => pushParams((p) => p.set('type', t.slug))}
            >
              {t.label} <span>({t.count})</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="maple-filter-group">
        <h2>Availability</h2>
        <label className="maple-filter-check">
          <input type="checkbox" checked={activeStock.includes('in')} onChange={() => toggleStock('in')} />
          In Stock <span>({stockCounts.inStock})</span>
        </label>
        <label className="maple-filter-check">
          <input type="checkbox" checked={activeStock.includes('coming')} onChange={() => toggleStock('coming')} />
          Coming Soon <span>({stockCounts.comingSoon})</span>
        </label>
      </div>
    </>
  );

  return (
    <div className="maple-shop-layout">
      <button type="button" className="maple-filter-toggle" aria-expanded={drawerOpen} aria-controls="maple-filter-drawer" onClick={() => setDrawerOpen((v) => !v)}>
        <SlidersHorizontal size={16} /> Filters
      </button>

      <aside className="maple-sidebar" aria-label="Filter maple products">
        {Sidebar}
      </aside>

      {drawerOpen && (
        <div className="maple-filter-drawer" id="maple-filter-drawer">
          <div className="maple-filter-drawer-head">
            <span>Filters</span>
            <button type="button" aria-label="Close filters" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
          </div>
          {Sidebar}
          <button type="button" className="button button-navy" onClick={() => setDrawerOpen(false)}>Show results</button>
        </div>
      )}

      <div className="maple-catalogue">
        <div className="maple-catalogue-head">
          <div>
            <h1>Maple Products</h1>
            <p>{totalMatching} {totalMatching === 1 ? 'product' : 'products'}</p>
          </div>
          <form
            ref={formRef}
            className="maple-tools"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const q = new FormData(event.currentTarget).get('q');
              pushParams((p) => {
                if (q && String(q).trim()) p.set('q', String(q).trim());
                else p.delete('q');
              });
            }}
          >
            <input
              className="store-input"
              type="search"
              name="q"
              defaultValue={searchParams.get('q') ?? ''}
              placeholder="Search maple products..."
              aria-label="Search maple products"
            />
            <select
              className="store-select"
              aria-label="Sort products"
              value={activeSort}
              onChange={(event) => pushParams((p) => {
                if (event.target.value) p.set('sort', event.target.value);
                else p.delete('sort');
              })}
            >
              <option value="">Sort by: Featured</option>
              <option value="name">Sort by: Name</option>
              <option value="price-asc">Sort by: Price, low to high</option>
            </select>
          </form>
        </div>

        {products.length ? (
          <>
            <div className="maple-grid">
              {products.map((p) => <MapleProductCard product={p} key={p.id} />)}
            </div>
            {totalMatching > pageSize && (
              <nav className="store-pagination" aria-label="Maple shop pages">
                {page > 1 && (
                  <button type="button" className="store-button secondary" onClick={() => pushParams((p) => p.set('page', String(page - 1)))}>Previous</button>
                )}
                <span>Page {page} of {Math.ceil(totalMatching / pageSize)}</span>
                {page * pageSize < totalMatching && (
                  <button type="button" className="store-button secondary" onClick={() => pushParams((p) => p.set('page', String(page + 1)))}>Next</button>
                )}
              </nav>
            )}
          </>
        ) : (
          <div className="store-empty">
            <h2>No products match these filters</h2>
            <p>Try clearing the search or category filters.</p>
            <button type="button" className="store-button" onClick={() => router.push('/maple-shop')}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
