'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ProductScroller({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="hub-scroller-wrap">
      <div className="hub-scroller" ref={ref}>{children}</div>
      <button type="button" className="hub-scroller-nav prev" aria-label="Previous category" onClick={() => scroll(-1)}>
        <ChevronLeft size={22} />
      </button>
      <button type="button" className="hub-scroller-nav next" aria-label="Next category" onClick={() => scroll(1)}>
        <ChevronRight size={22} />
      </button>
    </div>
  );
}
