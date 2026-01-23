import { useState, useEffect } from 'react';
import styles from './ButUp.module.css';

export default function ButUp() {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      // Показываем кнопку когда прокрутили больше 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.butup_box} onClick={scrollToTop}>
      <div className={styles.but__link}>Наверх ♂</div>
    </div>
  );
}
