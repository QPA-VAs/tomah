'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus } from 'lucide-react';
import type { ProductDetail } from '@/lib/api/types';
import { formatMoney } from '@/lib/money';
import { useStoreCart } from './cart-context';

export function MapleProductCard({ product }: { product: ProductDetail }) {
  const cart = useStoreCart();
  const available = product.variants.filter((v) => v.available);
  const [variantId, setVariantId] = useState(available[0]?.id ?? product.variants[0]?.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const variant = product.variants.find((v) => v.id === variantId);

  return (
    <article className="maple-card">
      <Link href={`/products/${product.slug}`} className="maple-card-media">
        <Image src={product.image.url} alt={product.image.alt} width={500} height={500} sizes="(max-width: 700px) 50vw, 320px" />
      </Link>
      <div className="maple-card-body">
        <span className={`maple-card-badge ${product.inStock ? 'in-stock' : 'coming-soon'}`}>
          {product.inStock ? 'In Stock' : 'Coming Soon'}
        </span>
        <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
        <p className="maple-card-desc">{product.shortDescription}</p>

        {product.inStock ? (
          <>
            <p className="maple-card-price">From {formatMoney(variant?.price ?? product.priceFrom, product.currency)}</p>

            {product.variants.length > 1 && (
              <label className="maple-card-variant">
                <span className="sr-only">Choose an option</span>
                <select
                  value={variantId}
                  onChange={(event) => setVariantId(event.target.value)}
                  aria-label={`Choose a ${product.name} option`}
                >
                  {product.variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.available}>
                      {v.name}{!v.available ? ' (out of stock)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="maple-card-actions">
              <div className="maple-card-qty" role="group" aria-label={`Quantity for ${product.name}`}>
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <Minus size={14} />
                </button>
                <span aria-live="polite">{qty}</span>
                <button type="button" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">
                  <Plus size={14} />
                </button>
              </div>
              <button
                type="button"
                className="maple-card-add"
                disabled={!variant?.available}
                onClick={() => {
                  if (!variant) return;
                  cart.add(product, variant, qty);
                  setAdded(true);
                  setQty(1);
                }}
              >
                Add to Cart
              </button>
            </div>
            {added && <p className="maple-card-added" role="status">Added to cart · <Link href="/cart">View cart</Link></p>}
          </>
        ) : (
          <button type="button" className="maple-card-add" disabled>Coming Soon</button>
        )}
      </div>
    </article>
  );
}
