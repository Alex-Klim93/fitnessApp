import Image from 'next/image';
import styles from './TestNav.module.css';
import Link from 'next/link';

export default function TestNav() {
  return (
    <div className={styles.TestNav}>
      <ul>
        <li className={styles.TestNav__li}>
          <Link href="/" className={styles.TestNav__link}>
            Home
          </Link>
        </li>
        <li className={styles.TestNav__li}>
          <Link href="/page/Course" className={styles.TestNav__link}>
            Course
          </Link>
        </li>
        <li className={styles.TestNav__li}>
          <Link href="/page/Video" className={styles.TestNav__link}>
            Video
          </Link>
        </li>
        <li className={styles.TestNav__li}>
          <Link href="/page/Profile" className={styles.TestNav__link}>
            Profile
          </Link>
        </li>
      </ul>
    </div>
  );
}
