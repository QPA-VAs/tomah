import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ShoppingBag, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { FaqAccordion } from '@/components/storefront/faq-accordion';
import { formatMoney } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Maple Shop | Tomah International',
  description: 'Shop organic maple syrup, sugar and butter online — shipped direct, no minimums.',
};

export default async function MapleShop() {
  const [maple, faqs, testimonials, recipes] = await Promise.all([
    api.listProducts({ category: 'MAPLE_PRODUCTS', pageSize: 6 }),
    api.getFaqs(),
    api.getTestimonials(),
    api.getRecipes(),
  ]);

  return (
    <main id="main">
      <section className="home-hero">
        <div className="shell home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-hero-eyebrow"><ArrowUpRight size={15} /> The Tomah maple shop</p>
            <h1 className="home-hero-title">Pure maple syrup.<br /><em>Straight from the tap.</em></h1>
            <p className="home-hero-lede">Organic maple syrup, sugar and butter from trusted Canadian producers — ordered online, shipped direct to your door, no minimums.</p>
            <div className="home-hero-actions">
              <a className="pill pill-solid" href="#shop">Shop maple products</a>
              <Link className="pill pill-outline" href="/recipes">Get recipe inspiration</Link>
            </div>
          </div>
          <div className="home-hero-visual">
            <Image src="/images/maple-syrup-lifestyle.jpg" alt="Tomah organic maple syrup bottle beside pancakes and a serving jar" fill sizes="(max-width: 900px) 100vw, 46vw" priority />
            <div className="home-hero-badge">
              <ShoppingBag size={18} />
              <div><strong>100% organic</strong><span>Canadian maple, ships direct</span></div>
              <a href="#shop">Shop now</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell" id="shop">
        <div className="section-heading">
          <div><p className="eyebrow">Order online</p><h2>Pure maple goodness,<br />crafted naturally.</h2></div>
          <p>No minimums, no wholesale accounts — just real maple syrup, sugar and butter shipped straight to your door.</p>
        </div>
        <div className="store-grid">
          {maple.items.map((p) => (
            <article className="store-card" key={p.id}>
              <Link className="store-card-media" href={`/products/${p.slug}`}>
                <Image src={p.image.url} alt={p.image.alt} width={700} height={700} />
              </Link>
              <div className="store-card-body">
                <h2><Link href={`/products/${p.slug}`}>{p.name}</Link></h2>
                <p>{p.shortDescription}</p>
                <div className="store-card-bottom">
                  <span>From {formatMoney(p.priceFrom, p.currency)}</span>
                  <Link href={`/products/${p.slug}`}>View product →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="maple section shell">
        <div className="maple-image-wrap"><Image src="/images/maple-pancakes.jpg" alt="Maple syrup poured over a stack of pancakes" fill sizes="(max-width: 800px) 100vw, 50vw" /><span>Tapped, boiled, bottled</span></div>
        <div className="maple-copy">
          <p className="eyebrow">From tap to table</p>
          <h2>Real maple, the traditional way.</h2>
          <p>Our syrup, sugar and butter are made from 100% pure maple sap — tapped and boiled by trusted Canadian producers, with no additives or shortcuts. Every bottle is graded for flavour before it ships.</p>
          <Link className="button button-navy" href="/products/maple-syrup">Shop pure maple syrup <ArrowRight size={18} /></Link>
        </div>
      </section>

      {testimonials.items.length > 0 && (
        <section className="testimonials-home section shell">
          <div className="faq-home-heading">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>What customers say</p>
            <h2>Trusted by home cooks and bakers.</h2>
          </div>
          <div className="testimonial-grid">
            {testimonials.items.map((t) => (
              <article className="testimonial-card" key={t.id}>
                {t.rating != null && (
                  <div className="testimonial-stars" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill={i < t.rating! ? 'currentColor' : 'none'} />)}
                  </div>
                )}
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <p className="testimonial-author">{t.name}{t.company && <span> · {t.company}</span>}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {recipes.items.length > 0 && (
        <section className="section shell">
          <div className="section-heading">
            <div><p className="eyebrow">Made with Tomah maple</p><h2>Recipes worth savouring.</h2></div>
            <p>Ideas for putting your maple syrup, sugar and butter to good use.</p>
          </div>
          <div className="store-grid">
            {recipes.items.slice(0, 3).map((r) => (
              <article className="store-card" key={r.id}>
                <Link className="store-card-media" href={`/recipes/${r.slug}`}>
                  <Image src={r.image.url} alt={r.image.alt} width={700} height={700} />
                </Link>
                <div className="store-card-body">
                  <h2><Link href={`/recipes/${r.slug}`}>{r.title}</Link></h2>
                  <p>{r.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {faqs.items.length > 0 && (
        <section className="faq-home section shell" id="faq">
          <div className="faq-home-heading">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Answers first</p>
            <h2>Frequently asked questions.</h2>
            <p>The most common questions before you order.</p>
          </div>
          <FaqAccordion items={faqs.items.slice(0, 6)} />
          <Link className="text-link faq-home-more" href="/faq">See all FAQs <ArrowRight size={18} /></Link>
        </section>
      )}

      <section className="quote section shell">
        <div><p className="eyebrow light">Sourcing more than maple?</p><h2>We also supply poultry, pork, seafood, grains and produce — wholesale.</h2></div>
        <div>
          <p>Tomah International supplies retailers, distributors and foodservice buyers with a full range of proteins, grains and produce, priced by quote.</p>
          <Link className="button button-gold" href="/products">Browse the wholesale range <ArrowRight size={18} /></Link>
        </div>
      </section>
    </main>
  );
}
