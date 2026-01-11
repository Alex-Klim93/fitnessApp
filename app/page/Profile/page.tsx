// app/page/profile/page.tsx

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import SkillCard from '@/app/components/SkillCard/SkillCard';
import MyСourses from '@/app/components/MyCourses/MyСourses';

export default function ProfilePage() {
  return (
    <div>
      <div className={styles.profile}>
        <h1 className={styles.profile__title}>Профиль</h1>
        <div className={styles.profile__box}>
          <Image
            width={197}
            height={197}
            className={styles.profile__img}
            src="/img/Mask group.png"
            alt="Sparcle"
            priority
          ></Image>
          <div>
            <h3 className={styles.profile__name}>Сергей</h3>
            <p className={styles.profile__login}>Логин: sergey.petrov96</p>
            <div className={styles.profile__but}>
              <Link href="/" className={styles.profile__link}>
                Войти
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.myCourses}>
        <h3 className={styles.myCourses__title}>Мои курсы</h3>
        <MyСourses />
      </div>
    </div>
  );
}
