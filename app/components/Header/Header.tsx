// app/components/Header/Header.tsx
'use client';

import Image from 'next/image';
import styles from './Header.module.css';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import SigninPopup from '@/app/components/PopUp/Signin/SigninPopup';
import SignupPopup from '@/app/components/PopUp/Signup/SignupPopup';
import {
  isAuthenticated,
  getUserEmail,
  getUserLogin,
  logout,
} from '@/app/api/auth';
import ProfilePopup from '../PopUp/ProfilePopup/ProfilePopup';

export default function Header() {
  const [isSigninOpen, setIsSigninOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loginName, setLoginName] = useState<string>('');

  // Проверяем авторизацию при загрузке и при изменении состояния
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthStatus(isAuth);

      if (isAuth) {
        const email = getUserEmail();
        const login = getUserLogin();

        setUserEmail(email || '');
        setLoginName(login || email?.split('@')[0] || 'Пользователь');
      } else {
        setUserEmail('');
        setLoginName('');
      }
    };

    checkAuth();

    // Слушаем события изменения авторизации
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const handleSigninClick = () => {
    setIsSigninOpen(true);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleLoginSuccess = () => {
    // Обновляем состояние после успешного входа
    const isAuth = isAuthenticated();
    setAuthStatus(isAuth);

    if (isAuth) {
      const email = getUserEmail();
      const login = getUserLogin();
      setUserEmail(email || '');
      setLoginName(login || email?.split('@')[0] || 'Пользователь');
    }
  };

  const handleRegisterSuccess = () => {
    handleLoginSuccess(); // Та же логика
  };

  const handleLogout = () => {
    logout();
    setAuthStatus(false);
    setUserEmail('');
    setLoginName('');
    setIsProfileOpen(false);
  };

  const handleOpenSignup = () => {
    setIsSigninOpen(false);
    setIsSignupOpen(true);
  };

  const handleOpenSignin = () => {
    setIsSignupOpen(false);
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
          />
          <Link href="/" className={styles.logo__link}>
            SkyFitnessPro
          </Link>
        </div>

        {authStatus ? (
          <div className={styles.profile_container}>
            <Image
              width={41.67}
              height={41.67}
              className={styles.profile__icon}
              src="/img/Icon.png"
              alt="Profile icon"
              priority
            />
            <button
              className={styles.profile_button}
              onClick={handleProfileClick}
            >
              <span className={styles.profile_login}>{loginName}</span>
              <span className={styles.profile_arrow}>▼</span>
            </button>
          </div>
        ) : (
          <div className={styles.but__box}>
            <button className={styles.but__link} onClick={handleSigninClick}>
              Войти
            </button>
          </div>
        )}
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

      {authStatus && (
        <ProfilePopup
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userEmail={userEmail}
          loginName={loginName}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}
