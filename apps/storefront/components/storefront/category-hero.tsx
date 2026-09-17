import { ArrowRight, ShoppingBag } from 'lucide-react';
import { CATEGORY_META } from '@/lib/categories';
import type { Category } from '@/lib/api/types';

/**
 * Full-width band at the top of the products page — an icon treatment for
 * the six wholesale-only categories (no product photography exists for them
 * yet), or a generic "shop everything" band when no category is picked. The
 * one retail category (maple) has its own dedicated banner at /maple-shop.
 */
export function CategoryHero({ category }: { category?: Category }) {
  const meta = category ? CATEGORY_META[category] : null;

  if (meta) {
    const Icon = meta.icon;
    return (
      <section className="category-hero category-hero--icon">
        <Icon className="category-hero-glyph" strokeWidth={0.65} aria-hidden />
        <div className="category-hero-content shell">
          <p className="store-kicker light"><Icon size={15} /> {meta.label}</p>
          <h1>{meta.heroBlurb}</h1>
          <a className="store-button gold" href="/quote">
            Request a wholesale quote <ArrowRight size={18} />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="category-hero category-hero--icon category-hero--all">
      <ShoppingBag className="category-hero-glyph" strokeWidth={0.55} aria-hidden />
      <div className="category-hero-content shell">
        <p className="store-kicker light">Our product range</p>
        <h1>Quality for every table.</h1>
        <p className="category-hero-copy">
          Maple products ship direct — order online below. Everything else we
          supply (poultry, pork, meats, seafood, grains, vegetables) is sold
          wholesale by the case.
        </p>
        <a className="store-button gold" href="/quote">
          Request a wholesale quote <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}
