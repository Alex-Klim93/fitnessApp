import Image from 'next/image';
import styles from './Header.module.css';
import Link from 'next/link';

export default function Header() {
  return (
    <div className={styles.header_box}>
      <div className={styles.header_logo}>
        <Image
          width={29}
          height={20}
          className={styles.logo__image}
          src="/img/Logo.png"
          alt="logo"
          priority
        ></Image>
        <Link href="/" className={styles.logo__link}>SkyFitnessPro</Link>
      </div>
      <div className={styles.but__box}>
        <Link href="/" className={styles.but__link}>Войти</Link>
      </div>
    </div>
  );
}
