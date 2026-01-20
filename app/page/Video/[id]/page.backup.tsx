// app/page/profile/page.tsx

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import VideoPlayer from '@/app/components/VideoPlayer/VideoPlayer';

export default function VideoPage() {
  return (
    <div>
      <div className={styles.video}>
        <h1 className={styles.video__title}>Йога</h1>
        <div className={styles.video__player}>
          <VideoPlayer />
        </div>
        <div className={styles.video__exercises}>
          <h4 className={styles.exercises__title}>Упражнения тренировки 2</h4>
          <div className={styles.exercises__box}>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>Наклоны вперед 0%</p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>Наклоны вперед 0%</p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>Наклоны вперед 0%</p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>Наклоны назад 0%</p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>Наклоны назад 0%</p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>Наклоны назад 0%</p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>
                Поднятие ног, согнутых в коленях 0%
              </p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>
                Поднятие ног, согнутых в коленях 0%
              </p>
              <div className={styles.exercises__sidebar}></div>
            </div>
            <div className={styles.exercises__min}>
              <p className={styles.exercises__text}>
                Поднятие ног, согнутых в коленях 0%
              </p>
              <div className={styles.exercises__sidebar}></div>
            </div>
          </div>
          <div className={styles.exercises__but}>
            <Link href="/" className={styles.exercises__link}>
              Заполнить свой прогресс
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
