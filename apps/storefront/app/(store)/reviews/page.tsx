import type { Metadata } from 'next';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Customer Reviews | Tomah International',
  description: 'What retailers, distributors and home customers say about Tomah International.',
};

export default async function ReviewsPage() {
  const testimonials = await api.getTestimonials();
  return (
    <main id="main" className="store-main">
      <p className="store-kicker">Customer experiences</p>
      <h1 className="store-title">What Our Customers Say</h1>
      <p className="store-intro">Feedback from the retailers, distributors and home customers we supply.</p>
      {testimonials.items.length ? (
        <div className="testimonial-grid" style={{ marginTop: 40 }}>
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
      ) : (
        <div className="store-empty" style={{ marginTop: 40 }}>
          <h2>No reviews yet</h2>
          <p>Check back soon — customer reviews will appear here.</p>
        </div>
      )}
    </main>
  );
}
