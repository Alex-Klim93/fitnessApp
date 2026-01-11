import Image from 'next/image';
import styles from './MainTitle.module.css';
import Link from 'next/link';

export default function MainTitle() {
  return (
    <div className={styles.title__main}>
      <h1 className={styles.title}>
        Начните заниматься спортом и улучшите качество жизни
      </h1>
      <div className={styles.title__discMain}>
      <div className={styles.title__discBox}>
        <p className={styles.title__discription}>
          Измени своё тело за полгода!
        </p>
        <div className={styles.title__svgBox}>
          <svg
            className={styles.title__svg}
            viewBox="0 0 30.2384 35.1705"
            width="30.238403"
            height="35.170532"
            fill="none"
            style={{
              filter: 'drop-shadow(0 0 1px #00000000)',
            }}
          >
            <path
              d="M3.25285 34.7255C1.65097 35.9972 -0.601266 34.3288 0.148526 32.4259L12.4256 1.26757C12.9078 0.043736 14.4198 -0.389332 15.4768 0.393651L29.4288 10.7288C30.4858 11.5118 30.5121 13.0844 29.4819 13.9023L3.25285 34.7255Z"
              fill="rgb(188,236,48)"
              fillRule="nonzero" // Изменено с fill-rule на fillRule
            />
          </svg>
        </div>
      </div>
      </div>
    </div>
  );
}
