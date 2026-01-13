'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';
import Subtitle from './components/Subtitle/Subtitle';
import MainTitle from './components/MainTitle/MainTitle';
import Сourses from './components/Сourses/Сourses';
import ButUp from './components/ButUp/ButUp';
import TestNav from './components/TestNav/TestNav';
import { checkAuthOnStart } from '@/app/api/auth-checker';

export default function Home() {
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Проверка авторизации при загрузке страницы
    const initializeApp = async () => {
      console.log('Initializing app...');

      try {
        const { isAuthenticated, user } = await checkAuthOnStart();
        console.log('Auth check result:', { isAuthenticated, user });

        if (isAuthenticated) {
          console.log(
            'Приложение запущено, пользователь авторизован:',
            user?.email
          );
        } else {
          console.log('Приложение запущено, пользователь не авторизован');
        }
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    initializeApp();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <TestNav />
          <Header />
          <Subtitle />
          <MainTitle />
          <Сourses />
          <ButUp />
        </main>
      </div>
    </div>
  );
}
