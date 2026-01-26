import styles from './Subtitle.module.css';

export default function Subtitle() {
  return (
    <div className={styles.subtitle}>
      <p className={styles.subtitle__description}>
        Онлайн-тренировки для занятий дома
      </p>
    </div>
  );
}
