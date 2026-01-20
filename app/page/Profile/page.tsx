// app/page/profile/page.tsx
'use client';

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout as authLogout, isAuthenticated } from '@/app/api/auth';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store/store';
import { loadUserProfile } from '@/app/store/slices/authSlice'; // Используем новое имя
import dynamic from 'next/dynamic';
import { useGetCurrentUserQuery } from '@/app/api/userApi';

// Ленивая загрузка тяжелого компонента
const MyСourses = dynamic(
  () => import('@/app/components/MyCourses/MyСourses'),
  {
    loading: () => <div>Загрузка курсов...</div>,
  }
);

export default function ProfilePage() {
  const [userLogin, setUserLogin] = useState<string>('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { data: userData, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated(),
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated()) {
        console.log('Пользователь не авторизован, перенаправляем на SignIn');
        router.push('/page/SignIn');
        return;
      }

      // Загружаем данные пользователя через Redux
      dispatch(loadUserProfile()); // Используем новое имя
    };

    checkAuth();
  }, [router, dispatch]);

  useEffect(() => {
    if (userData?.user?.email) {
      const login = userData.user.email.split('@')[0];
      setUserLogin(login);
    } else if (userData?.email) {
      // Альтернативная структура данных
      const login = userData.email.split('@')[0];
      setUserLogin(login);
    }
  }, [userData]);

  const handleLogout = () => {
    authLogout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Загрузка профиля...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Пользователь не найден</div>
      </div>
    );
  }

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
            alt="Profile"
            priority
          />
          <div>
            <h3 className={styles.profile__name}>Сергей</h3>
            <p className={styles.profile__login}>Логин: {userLogin}</p>
            <div className={styles.profile__but}>
              <Link
                href="#"
                className={styles.profile__link}
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                Выйти
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
