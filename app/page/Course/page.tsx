// app/page/profile/page.tsx

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import SkillCard from '@/app/components/SkillCard/SkillCard';

export default function CoursePage() {
  return (
    <div>
      <SkillCard />

      <div className={styles.entice}>
        <h3 className={styles.entice__title}>Подойдет для вас, если:</h3>
        <div className={styles.entice__disBox}>
          <div className={styles.entice__dis}>
            <p className={styles.entice__numb}>1</p>
            <p className={styles.entice__text}>
              Давно хотели попробовать йогу, но не решались начать
            </p>
          </div>
          <div className={styles.entice__dis}>
            <p className={styles.entice__numb}>2</p>
            <p className={styles.entice__text}>
              Хотите укрепить позвоночник, избавиться от болей в спине и
              суставах
            </p>
          </div>
          <div className={styles.entice__dis}>
            <p className={styles.entice__numb}>3</p>
            <p className={styles.entice__text}>
              Ищете активность, полезную для тела и души
            </p>
          </div>
        </div>
      </div>

      <div className={styles.Directions}>
        <h3 className={styles.Directions__title}>Направления</h3>
        <div className={styles.Directions__box}>
          <div className={styles.Directions__description}>
            <Image
              width={26}
              height={26}
              className={styles.Directions__img}
              src="/img/Sparcle.svg"
              alt="Sparcle"
              priority
            ></Image>
            <p className={styles.Directions__text}>Йога для новичков</p>
          </div>
          <div className={styles.Directions__description}>
            <Image
              width={26}
              height={26}
              className={styles.Directions__img}
              src="/img/Sparcle.svg"
              alt="Sparcle"
              priority
            ></Image>
            <p className={styles.Directions__text}>Кундалини-йога</p>
          </div>
          <div className={styles.Directions__description}>
            <Image
              width={26}
              height={26}
              className={styles.Directions__img}
              src="/img/Sparcle.svg"
              alt="Sparcle"
              priority
            ></Image>
            <p className={styles.Directions__text}>Хатха-йога</p>
          </div>
          <div className={styles.Directions__description}>
            <Image
              width={26}
              height={26}
              className={styles.Directions__img}
              src="/img/Sparcle.svg"
              alt="Sparcle"
              priority
            ></Image>
            <p className={styles.Directions__text}>Классическая йога</p>
          </div>
          <div className={styles.Directions__description}>
            <Image
              width={26}
              height={26}
              className={styles.Directions__img}
              src="/img/Sparcle.svg"
              alt="Sparcle"
              priority
            ></Image>
            <p className={styles.Directions__text}>Йогатерапия</p>
          </div>
          <div className={styles.Directions__description}>
            <Image
              width={26}
              height={26}
              className={styles.Directions__img}
              src="/img/Sparcle.svg"
              alt="Sparcle"
              priority
            ></Image>
            <p className={styles.Directions__text}>Аштанга-йога</p>
          </div>
        </div>
      </div>

      <div className={styles.motivation}>
        <div className={styles.motivation__box}>
          <h3 className={styles.motivation__title}>
            Начните путь к новому телу
          </h3>
          <p className={styles.motivation__text}>
            • проработка всех групп мышц
            <br />
            • тренировка суставов
            <br />
            • улучшение циркуляции крови
            <br />
            • упражнения заряжают бодростью
            <br />• помогают противостоять стрессам
          </p>
          <div className={styles.motivation__but}>
            <Link href="/" className={styles.motivation__butLink}>
              Войдите, чтобы добавить курс
            </Link>
          </div>
        </div>
        <Image
          width={670.18}
          height={390.98}
          className={styles.Directions__imgSvg2}
          src="/img/Vector 6084.svg"
          alt="Sparcle"
          priority
        ></Image>
        <Image
          width={50}
          height={42.5}
          className={styles.Directions__imgSvg1}
          src="/img/Vector 6094.svg"
          alt="Sparcle"
          priority
        ></Image>
        <Image
          width={547}
          height={566}
          className={styles.Directions__img}
          src="/img/skypro_mid23_Crouching_man_in_green_polo_shirt_and_navy_shorts__934c6a97-07c8-4c5b-9487-96389d003dfd Background Removed 2.png"
          alt="Sparcle"
          priority
        ></Image>
      </div>
    </div>
  );
}
