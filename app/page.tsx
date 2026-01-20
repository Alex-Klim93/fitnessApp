// app/page.tsx
'use client';

import { useEffect } from 'react';
import Header from '@/app/components/Header/Header';
import styles from './page.module.css';
import Subtitle from './components/Subtitle/Subtitle';
import MainTitle from './components/MainTitle/MainTitle';
import Сourses from './components/Сourses/Сourses';
import ButUp from './components/ButUp/ButUp';
import TestNav from '@/app/components/TestNav/TestNav';
// УДАЛИТЬ ЭТУ СТРОКУ: import { initializeUser } from '@/app/api/auth';

export default function Home() {
  useEffect(() => {
    // Простая проверка авторизации при загрузке
    const initApp = () => {
      const token = localStorage.getItem('auth_token');
      const email = localStorage.getItem('user_email');

      console.log(
        'Инициализация приложения:',
        token ? 'Авторизован' : 'Не авторизован'
      );
      if (email) {
        console.log('Пользователь:', email);
      }
    };

    initApp();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
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
