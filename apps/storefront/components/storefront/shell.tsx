'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Mail, MapPin, Package, Phone, ShoppingBag } from 'lucide-react';
import { MobileNavigation } from '../mobile-navigation';
import { HeaderSearch } from './header-search';
import { StoreCartProvider, useStoreCart } from './cart-context';

const NAV_LINKS: [string, string][] = [
  ['Home', '/'],
  ['Maple Shop', '/maple-shop'],
  ['Products', '/products'],
  ['Wholesale', '/wholesale'],
  ['About Us', '/about'],
  ['Contact', '/contact'],
];

function CartLink() {
  const { count } = useStoreCart();
  return (
    <Link className="store-cart-link" href="/cart" aria-label={`Cart with ${count} items`}>
      <ShoppingBag size={19} />
      <span>Cart</span>
      <b>{count}</b>
    </Link>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <div className="storefront">
      <a className="shop-skip" href="#main">Skip to content</a>
      <header className="store-header">
        <Link href="/" className="store-logo">
          <Image src="/images/tomah-logo-navy.jpg" alt="Tomah International" width={82} height={64} priority />
        </Link>
        <nav aria-label="Store navigation">
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href} className={isActive(href) ? 'active' : ''} aria-current={isActive(href) ? 'page' : undefined}>{label}</Link>
          ))}
        </nav>
        <div className="store-actions">
          <HeaderSearch />
          <Link className="store-account-link" href="/orders/track" aria-label="Track your order">
            <Package size={19} />
          </Link>
          <CartLink />
          <a className="store-wholesale-cta" href="/quote">
            Request a Quote <ArrowRight size={15} />
          </a>
          <MobileNavigation links={NAV_LINKS} actionLabel="Request a Quote" actionHref="/quote" />
        </div>
      </header>
      {children}
      <footer className="store-footer">
        <div className="store-footer-brand">
          <Image src="/images/tomah-logo-navy.jpg" alt="Tomah International" width={70} height={64} />
          <p>Connecting Quality Food with the World.</p>
        </div>
        <div className="store-footer-col">
          <h3>Explore</h3>
          {NAV_LINKS.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </div>
        <div className="store-footer-col">
          <h3>Support</h3>
          <Link href="/faq">FAQs</Link>
          <Link href="/legal/returns">Shipping</Link>
          <Link href="/legal/returns">Returns</Link>
          <Link href="/legal/privacy">Privacy Policy</Link>
          <Link href="/legal/terms">Terms &amp; Conditions</Link>
        </div>
        <div className="store-footer-col">
          <h3>Contact</h3>
          <span><MapPin size={15} /> <span>7901 4th St N, Ste 31326, St. Petersburg, FL 33702, USA</span></span>
          <a href="mailto:info@tomahinc.com"><Mail size={15} /> <span>info@tomahinc.com</span></a>
          <a href="tel:+14074055021"><Phone size={15} /> <span>+1 407 405 5021</span></a>
        </div>
      </footer>
    </div>
  );
}

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreCartProvider>
      <Frame>{children}</Frame>
    </StoreCartProvider>
  );
}
