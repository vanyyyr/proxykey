import type { Metadata } from 'next';
import './globals.css';
import { setWebhook } from '@/lib/telegram';

export const metadata: Metadata = {
  title: 'ProxyKey | Elite Proxy Infrastructure',
  description: 'Premium subscription proxy keys for professionals.',
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';
if (SITE_URL && process.env.NODE_ENV === 'production') {
  setWebhook(SITE_URL).catch(console.error);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
