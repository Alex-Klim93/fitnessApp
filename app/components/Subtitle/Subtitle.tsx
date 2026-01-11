import Image from 'next/image';
import styles from './Subtitle.module.css';
import Link from 'next/link';

export default function Subtitle() {
  return (
    <div className={styles.subtitle}>
      <p className={styles.subtitle__description}>
        Онлайн-тренировки для занятий дома
      </p>
    </div>
  );
}
