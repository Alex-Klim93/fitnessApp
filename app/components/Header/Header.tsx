'use client';

import Image from 'next/image';
import styles from './Header.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SigninPopup from '@/app/components/PopUp/Signin/SigninPopup';
import SignupPopup from '@/app/components/PopUp/Signup/SignupPopup';
import { checkAuthOnStart } from '@/app/api/auth-checker';
import { isAuthenticated, getCurrentUser, logout } from '@/app/api/auth';

export default function Header() {
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      const { isAuthenticated: isAuth, user } = await checkAuthOnStart();
      if (isAuth) {
        setCurrentUser(user);
        console.log('Пользователь авторизован:', user?.email);
      }
      setIsAuthChecked(true);
    };

    checkAuth();
  }, []);

  const handleAuthClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated()) {
      // Если пользователь уже авторизован
      console.log('Пользователь уже вошел в систему');
      // Можно показать меню пользователя или сделать logout
    } else {
      setIsSigninOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    // Обновляем состояние после успешного входа
    const user = getCurrentUser();
    setCurrentUser(user);
    console.log('Вход выполнен успешно:', user?.email);
  };

  const handleRegisterSuccess = () => {
    // Обновляем состояние после успешной регистрации
    const user = getCurrentUser();
    setCurrentUser(user);
    console.log('Регистрация выполнена успешно:', user?.email);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const handleOpenSignup = () => {
    setIsSignupOpen(true);
  };

  const handleOpenSignin = () => {
    setIsSigninOpen(true);
  };

  return (
    <>
      <div className={styles.header_box}>
        <div className={styles.header_logo}>
          <Image
            width={29}
            height={20}
            className={styles.logo__image}
            src="/img/Logo.png"
            alt="logo"
            priority
          ></Image>
          <Link href="/" className={styles.logo__link}>
            SkyFitnessPro
          </Link>
        </div>
        <div className={styles.but__box} onClick={handleAuthClick}>
          {isAuthChecked &&
            (currentUser ? (
              <div className={styles.userMenu}>
                <span className={styles.userEmail}>{currentUser.email}</span>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            ) : (
              <Link
                href="/"
                className={styles.but__link}
                onClick={(e) => e.preventDefault()}
              >
                Войти
              </Link>
            ))}
        </div>
      </div>

      <SigninPopup
        isOpen={isSigninOpen}
        onClose={() => setIsSigninOpen(false)}
        onOpenSignup={handleOpenSignup}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignupPopup
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onOpenSignin={handleOpenSignin}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </>
  );
}
