'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

export function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div className={`store-search ${open ? 'open' : ''}`} ref={root}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const q = value.trim();
          setOpen(false);
          router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
        }}
      >
        <input
          ref={input}
          type="search"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          tabIndex={open ? 0 : -1}
        />
        <button type="submit" aria-label="Submit search" tabIndex={open ? 0 : -1}><Search size={17} /></button>
      </form>
      <button
        ref={toggle}
        type="button"
        className="store-search-toggle"
        aria-label={open ? 'Close search' : 'Search products'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={19} /> : <Search size={19} />}
      </button>
    </div>
  );
}
