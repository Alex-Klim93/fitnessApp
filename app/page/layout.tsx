// app/page/layout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Header from '../components/Header/Header';
import Subtitle from '../components/Subtitle/Subtitle';
import styles from './page.module.css';
import TestNav from '../components/TestNav/TestNav';

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCoursePage =
    pathname === '/page/Course' || pathname === '/page/Course/';

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <TestNav />
          <Header />
          {isCoursePage && <Subtitle />}

          <div className={styles.main__padding}>{children}</div>
        </main>
      </div>
    </div>
  );
}
