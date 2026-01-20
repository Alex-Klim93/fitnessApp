import styles from './ButUp.module.css';

export default function ButUp() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={styles.butup_box} onClick={scrollToTop}>
      <div className={styles.but__link}>
        Наверх ♂
      </div>
    </div>
  );
}