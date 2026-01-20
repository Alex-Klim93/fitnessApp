// app/page/profile/page.tsx
'use client';

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout as authLogout, isAuthenticated } from '@/app/api/auth';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/app/store/store';
import { loadUserData } from '@/app/store/slices/authSlice';
import MyСourses from '@/app/components/MyCourses/MyСourses';

export default function ProfilePage() {
  const [userLogin, setUserLogin] = useState<string>('');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Получаем данные из Redux
  const { user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    console.log('ProfilePage: user из Redux:', user);
    console.log('ProfilePage: selectedCourses:', user?.selectedCourses);
    console.log(
      'ProfilePage: количество курсов:',
      user?.selectedCourses?.length || 0
    );
  }, [user]);

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const isAuth = isAuthenticated();

      if (!isAuth) {
        console.log('Пользователь не авторизован, перенаправляем на SignIn');
        router.push('/page/SignIn');
        return;
      }

      // Загружаем данные пользователя через Redux
      dispatch(loadUserData());
    };

    checkAuthAndLoadData();
  }, [router, dispatch]);

  useEffect(() => {
    if (user?.email) {
      const login = user.email.split('@')[0];
      setUserLogin(login);
    }
  }, [user]);

  const handleLogout = () => {
    authLogout();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Загрузка профиля...</div>
      </div>
    );
  }

  if (!user) {
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
