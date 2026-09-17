import Image from 'next/image';
import Link from 'next/link';
import { FaqAccordion } from '@/components/storefront/faq-accordion';
import {
  ArrowRight, Boxes, Check, ClipboardCheck, FileText, Gem, Globe2, Handshake,
  Leaf, ShieldCheck, Star, Truck, Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CATEGORY_META } from '@/lib/categories';
import type { Category } from '@/lib/api/types';

const HERO_TRUST = [
  [Leaf, '100% Natural', 'Pure Maple Products'],
  [ShieldCheck, 'Trusted Sources', 'Quality Assured'],
  [Globe2, 'Global Supply', 'Delivering Worldwide'],
] as const;

// Wholesale-only grid; maple (retail) gets its own dedicated section below
// instead of a slot here, so the two product lines don't read as duplicates.
const HOME_CATEGORY_ORDER: Category[] = [
  'POULTRY', 'PORK', 'MEATS', 'SEAFOOD', 'GRAINS', 'VEGETABLES_AND_FRIES',
];
const CATEGORY_IMAGES: Partial<Record<Category, string>> = {
  POULTRY: '/images/category-poultry.jpg',
  PORK: '/images/category-pork.jpg',
  MEATS: '/images/category-meats.jpg',
  SEAFOOD: '/images/category-seafood.jpg',
  GRAINS: '/images/category-grains.jpg',
  VEGETABLES_AND_FRIES: '/images/category-vegetables-fries.jpg',
};

const WHOLESALE_STEPS = [
  [FileText, '01', 'Tell us what you need', 'Share your product, volume and destination requirements.'],
  [Users, '02', 'We source & confirm', 'Our team aligns supply, specifications and commercial terms.'],
  [ClipboardCheck, '03', 'Receive your quotation', 'Get transparent, itemised pricing for your order.'],
  [Truck, '04', 'We coordinate delivery', 'From documentation to shipment, we keep the process moving.'],
] as const;

const WHY_TOMAH = [
  [Gem, 'Quality', 'Freshness, consistency and value.'],
  [Handshake, 'Integrity', 'Honest and responsible business practices.'],
  [ShieldCheck, 'Reliability', 'Strong relationships with producers and customers.'],
  [Leaf, 'Responsible Sourcing', 'Working with reputable suppliers worldwide.'],
  [Users, 'Customer Commitment', 'Products and solutions built around your needs.'],
] as const;

export default async function Home() {
  const [faqs, testimonials] = await Promise.all([
    api.getFaqs(),
    api.getTestimonials(),
  ]);

  return (
    <main id="main">
      {/* ---------------------------- hero ---------------------------- */}
      <section className="hero" id="top">
        <Image src="/images/maple-syrup-lifestyle.jpg" alt="Tomah maple syrup bottle beside a stack of pancakes with berries" fill priority sizes="100vw" className="hero-image" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="shell hero-content">
          <p className="eyebrow">Quality products. Global markets.</p>
          <h1>Premium Maple.<br /><em>Global Food Supply.</em></h1>
          <p className="hero-copy">
            Tomah International sources and supplies high quality food products to customers and
            markets around the world. From pure maple products for your home, to reliable wholesale
            supply for your business — we connect quality to every table.
          </p>
          <div className="hero-actions">
            <Link className="pill pill-solid" href="/maple-shop">Shop Maple Products <ArrowRight size={17} /></Link>
            <Link className="pill pill-outline light" href="/quote">Request Wholesale Quote <ArrowRight size={17} /></Link>
          </div>
          <div className="hero-trust">
            {HERO_TRUST.map(([Icon, title, sub]) => (
              <div className="hero-trust-item" key={title}>
                <Icon size={22} strokeWidth={1.6} />
                <div><b>{title}</b><span>{sub}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------- two ways to work with tomah -------------- */}
      <section className="section shell" id="two-ways">
        <div className="section-heading-row">
          <div><p className="eyebrow">Two ways to work with Tomah</p><h2>For Homes and Businesses Worldwide</h2></div>
        </div>
        <p className="section-lede">Same commitment. Different needs. Quality products for every table.</p>
        <div className="way-grid">
          <article className="way-card way-card--retail">
            <div className="way-card-media way-card-media--product">
              <Image src="/images/maple-syrup-bottle-cutout.png" alt="Tomah pure maple syrup bottle" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: 'contain', padding: 24 }} />
            </div>
            <div className="way-card-body">
              <p className="way-card-tag">Maple Shop</p>
              <h3>For Individuals &amp; Families</h3>
              <p>Explore our range of pure maple products and enjoy natural goodness delivered to your door.</p>
              <Link className="button button-navy" href="/maple-shop">Shop Maple Products <ArrowRight size={17} /></Link>
            </div>
          </article>
          <article className="way-card way-card--wholesale">
            <div className="way-card-media">
              <Image src="/images/wholesale-spread.jpg" alt="Poultry, beef, pork, seafood and grains arranged together" fill sizes="(max-width: 900px) 100vw, 50vw" />
            </div>
            <div className="way-card-body">
              <p className="way-card-tag">Wholesale Supply</p>
              <h3>For Businesses &amp; Distributors</h3>
              <p>Access a wide range of food products including poultry, pork, meats, seafood, grains and more.</p>
              <Link className="button button-gold" href="/quote">Request a Wholesale Quote <ArrowRight size={17} /></Link>
            </div>
          </article>
        </div>
      </section>

      {/* --------------------------- categories --------------------------- */}
      <section className="products section" id="categories"><div className="shell">
        <div className="section-heading-row">
          <div><p className="eyebrow">Our product categories</p><h2>Quality Food. Trusted Sources.<br />Delivered Worldwide.</h2></div>
          <Link className="text-link" href="/products">View All Products <ArrowRight size={17} /></Link>
        </div>
        <p className="section-lede">From poultry and meats to seafood, grains and vegetables, we connect quality food products with global opportunities.</p>
        <div className="category-grid">{HOME_CATEGORY_ORDER.map((id) => {
          const meta = CATEGORY_META[id];
          const href = `/categories/${id}`;
          const image = CATEGORY_IMAGES[id];
          const Icon = meta.icon;
          return (
            <article className="category-card" key={id}>
              <Link href={href} className="category-card-media" aria-hidden="true" tabIndex={-1}>
                {image ? (
                  <Image src={image} alt="" fill sizes="(max-width: 700px) 50vw, 260px" style={{ objectFit: 'cover' }} />
                ) : (
                  <span className="category-card-media-fallback"><Icon size={34} strokeWidth={1.5} /></span>
                )}
              </Link>
              <span className="category-card-badge">Wholesale Only</span>
              <div className="category-card-body">
                <h3>{meta.label}</h3>
                <Link href={href}>Request a Quote <ArrowRight size={16} /></Link>
              </div>
            </article>
          );
        })}</div>
      </div></section>

      {/* ------------------------- maple shop teaser ----------------------- */}
      <section className="maple section shell" id="maple-teaser">
        <div className="maple-image-wrap maple-trio-wrap">
          <div className="maple-trio">
            <Image src="/images/maple/syrup.png" alt="Tomah maple syrup" width={340} height={340} />
            <Image src="/images/maple/sugar.png" alt="Tomah maple sugar" width={290} height={290} />
            <Image src="/images/maple/butter.png" alt="Tomah maple butter" width={290} height={290} />
          </div>
        </div>
        <div className="maple-copy">
          <p className="eyebrow">The Tomah Maple Shop</p>
          <h2>Pure Maple Goodness</h2>
          <p className="maple-subhead">Natural. Authentic. Premium.</p>
          <ul className="check-list">
            <li><Check size={16} /> Maple Syrup</li>
            <li><Check size={16} /> Maple Sugar</li>
            <li><Check size={16} /> Maple Butter</li>
            <li><Check size={16} /> And more</li>
          </ul>
          <Link className="button button-navy" href="/maple-shop">Explore the Maple Collection <ArrowRight size={18} /></Link>
        </div>
      </section>

      {/* --------------------------- how wholesale works -------------------- */}
      <section className="wholesale-process section" id="how-wholesale-works"><div className="shell">
        <p className="eyebrow light">How wholesale works</p>
        <h2>From Inquiry to Delivery</h2>
        <div className="wholesale-steps">
          {WHOLESALE_STEPS.map(([Icon, number, title, body]) => (
            <article key={number}>
              <span className="wholesale-step-icon"><Icon size={24} strokeWidth={1.6} /><b>{number}</b></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <Link className="button button-gold" href="/quote">Start a Wholesale Inquiry <ArrowRight size={18} /></Link>
      </div></section>

      {/* ------------------------------ why tomah ---------------------------- */}
      <section className="section shell" id="why-tomah">
        <div className="faq-home-heading">
          <p className="eyebrow" style={{ justifyContent: 'center' }}>Why Tomah?</p>
          <h2>A Trusted Global Food Partner</h2>
        </div>
        <div className="why-grid">
          {WHY_TOMAH.map(([Icon, title, body]) => (
            <div className="why-item" key={title}>
              <span><Icon size={26} strokeWidth={1.6} /></span>
              <b>{title}</b>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ reviews ------------------------------ */}
      {testimonials.items.length > 0 && (
        <section className="testimonials-home section shell">
          <div className="section-heading-row">
            <div><p className="eyebrow">Customer experiences</p><h2>What Our Customers Say</h2></div>
            <Link className="text-link" href="/reviews">View All Reviews <ArrowRight size={17} /></Link>
          </div>
          <div className="testimonial-grid">
            {testimonials.items.slice(0, 3).map((t) => (
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

      {/* -------------------------------- faq -------------------------------- */}
      {faqs.items.length > 0 && (
        <section className="faq-home section shell" id="faq">
          <div className="faq-home-heading">
            <p className="eyebrow" style={{ justifyContent: 'center' }}>Need to know</p>
            <h2>Frequently Asked Questions</h2>
            <p>The most useful questions from maple shop and wholesale customers.</p>
          </div>
          <FaqAccordion items={faqs.items.slice(0, 6)} />
          <Link className="text-link faq-home-more" href="/faq">View All FAQs <ArrowRight size={18} /></Link>
        </section>
      )}

      {/* ------------------------------ final cta ----------------------------- */}
      <section className="quote final-cta section shell">
        <div>
          <p className="eyebrow light">Ready to work with Tomah?</p>
          <h2>Ready to Work with Tomah?</h2>
          <p>Whether you&rsquo;re looking for premium maple products or a reliable food supply partner, we&rsquo;re here to help.</p>
          <div className="final-cta-actions">
            <Link className="button button-gold" href="/maple-shop">Shop Maple Products <ArrowRight size={18} /></Link>
            <Link className="button button-outline-light" href="/quote">Request Wholesale Quote <ArrowRight size={18} /></Link>
          </div>
        </div>
        <div className="final-cta-trust">
          <span><ShieldCheck size={20} /> Quality Products</span>
          <span><Globe2 size={20} /> Trusted Sources</span>
          <span><Boxes size={20} /> Global Reach</span>
        </div>
      </section>
    </main>
  );
}
