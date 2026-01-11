// app/layout.tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

// Настройка шрифта Roboto
const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-roboto',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'Мое приложение',
  description: 'Приложение с шрифтом Roboto',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={roboto.variable}>
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
