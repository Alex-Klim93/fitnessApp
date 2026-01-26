// app/layout.tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import StoreProvider from './store/StoreProvider';

const roboto = Roboto({
  subsets: ['latin', 'cyrillic'],
  weight: ['100', '300', '400', '500', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-roboto',
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
      <body className={roboto.className}>
        {/* StoreProvider будет инициализировать Redux store только один раз на клиенте */}
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
