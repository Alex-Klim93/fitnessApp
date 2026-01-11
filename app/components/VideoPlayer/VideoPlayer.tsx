import Image from 'next/image';
import styles from './VideoPlayer.module.css';
import Link from 'next/link';

export default function VideoPlayer() {
  return (
    <div className={styles.Player__box}>
      <Image
        width={156}
        height={156}
        className={styles.Player__img}
        src="/img/Subtract.svg"
        alt="Subtract"
        priority
      ></Image>
    </div>
  );
}
