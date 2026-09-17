import type { Metadata } from 'next';
import { DM_Sans, Manrope } from 'next/font/google';
import './globals.css';

const heading = Manrope({ variable: '--font-heading', subsets: ['latin'], weight: ['400', '700'] });
const body = DM_Sans({ variable: '--font-body', subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Tomah International | Pure Maple Syrup Shop & Wholesale Food Supply',
  description: 'Shop organic maple syrup, sugar and butter online — plus wholesale poultry, pork, seafood, grains and produce by quote.',
  openGraph: { title: 'Tomah International | The maple shop', description: 'Organic maple syrup, sugar and butter, shipped direct. Wholesale poultry, pork, seafood, grains and produce by quote.', images: ['/images/maple-syrup-lifestyle.jpg'] },
  twitter: { card: 'summary_large_image', title: 'Tomah International | The maple shop', description: 'Organic maple syrup, sugar and butter, shipped direct. Wholesale poultry, pork, seafood, grains and produce by quote.', images: ['/images/maple-syrup-lifestyle.jpg'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-api-mode={process.env.TOMAH_API_MODE === 'live' ? 'live' : 'mock'}><body className={`${heading.variable} ${body.variable}`}>{children}</body></html>;
}
