import Image from 'next/image';
import styles from './SkillCard.module.css';
import Link from 'next/link';

export default function CoursePage() {
  return (
    <div>
      <div className={styles.main__box}>
        <Image
          width={1023}
          height={683}
          className={styles.main__image}
          src="/img/image_9.png"
          alt="Circle"
          priority
        />
        <h1 className={styles.main__title}>Йога</h1>
      </div>
    </div>
  );
}
