import Image from 'next/image';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';
import Subtitle from './components/Subtitle/Subtitle';
import MainTitle from './components/MainTitle/MainTitle';
import Сourses from './components/Сourses/Сourses';
import ButUp from './components/ButUp/ButUp';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Header />
          <Subtitle />
          <MainTitle />
          <Сourses />
          <ButUp />
        </main>
      </div>
    </div>
  );
}
