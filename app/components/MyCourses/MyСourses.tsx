import Image from 'next/image';
import styles from './MyСourses.module.css';
import Link from 'next/link';

export default function MyСourses() {
  return (
    <div className={styles.courses__box}>
      <article className={styles.courses__card}>
        <div className={styles.courses__imgBox}>
          <Image
            width={360}
            height={325}
            className={styles.courses__image}
            src="/img/image9.png"
            alt="logo"
            priority
          />
          <div>
            <Image
              width={32}
              height={32}
              className={styles.courses__imageSvg}
              src="/img/Circle.svg"
              alt="Circle"
              priority
            />
          </div>
        </div>
        <div className={styles.courses__descrip}>
          <h3 className={styles.courses__title}>Йога</h3>
          <div className={styles.courses__periodBox}>
            <div className={styles.courses__period}>
              <div className={styles.courses__days}>
                <Image
                  width={18}
                  height={18}
                  className={styles.courses__daysImg}
                  src="/img/Calendar.svg"
                  alt="Add-in-Circle"
                  priority
                />
                <p className={styles.courses__daysDisc}>25 дней</p>
              </div>
              <div className={styles.courses__minDay}>
                <Image
                  width={18}
                  height={18}
                  className={styles.courses__minDayImg}
                  src="/img/Time.svg"
                  alt="Add-in-Circle"
                  priority
                />
                <p className={styles.courses__minDayDisc}>20-50 мин/день</p>
              </div>
              <div className={styles.courses__complexity}>
                <Image
                  width={18}
                  height={18}
                  className={styles.courses__minDayImg}
                  src="/img/mingcute.svg"
                  alt="mingcute_signal-fill"
                  priority
                />
                <p className={styles.courses__minDayDisc}>Сложность</p>
              </div>
            </div>
            <div className={styles.progres__box}>
              <p className={styles.progres__percent}>Прогресс 40%</p>
              <div className={styles.progres__sidebar}></div>
            </div>
            <div className={styles.progres__but}>
              <Link href="/" className={styles.progres__link}>
                Продолжить
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
