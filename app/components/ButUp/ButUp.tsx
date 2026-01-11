import Image from 'next/image';
import styles from './ButUp.module.css';
import Link from 'next/link';

export default function ButUp() {
  return (
    <div className={styles.butup_box}>
        <Link href="/" className={styles.but__link}>
          Наверх ♂
        </Link>
    </div>
  );
}
