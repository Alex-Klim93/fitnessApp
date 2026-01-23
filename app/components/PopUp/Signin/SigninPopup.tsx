// app/components/SigninPopup/SigninPopup.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './SigninPopup.module.css';
import { login, isAuthenticated } from '@/app/api/auth';
import { getErrorMessage } from '@/app/api/errors';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
  onLoginSuccess?: () => void;
}

export default function SigninPopup({
  isOpen,
  onClose,
  onOpenSignup,
  onLoginSuccess,
}: AuthPopupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      // Проверяем, не авторизован ли уже пользователь
      if (isAuthenticated()) {
        handleClose();
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    const validationErrors: string[] = [];
    if (!email.trim()) validationErrors.push('Введите Email');
    if (!password.trim()) validationErrors.push('Введите пароль');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      await login(email, password);

      // Уведомляем все компоненты об изменении состояния авторизации
      window.dispatchEvent(new Event('authStateChanged'));

      // Вызываем callback успешного входа если есть
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Закрываем попап
      handleClose();

    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      setErrors([errorMessage]);
      setLoading(false);
    }
  };

  const handleOpenSignup = () => {
    handleClose();
    onOpenSignup();
  };

  const isInputError = (field: string) => {
    return errors.some(
      (error) =>
        ((error.includes('Email') || error.includes('email')) &&
          field === 'email') ||
        ((error.includes('пароль') || error.includes('Пароль')) &&
          field === 'password')
    );
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setErrors([]);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
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

        <form onSubmit={handleSubmit}>
          <div className={styles.auth__Box}>
            <div className={styles.auth__inputBox}>
              <input
                className={`${styles.auth__input} ${isInputError('email') ? styles.inputError : ''}`}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <input
                className={`${styles.auth__input} ${isInputError('password') ? styles.inputError : ''}`}
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              {errors.length > 0 && (
                <div className={styles.errorBox}>
                  {errors.map((error, index) => (
                    <div key={index} className={styles.errorText}>
                      {error}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.auth__butBox}>
              <button
                className={styles.auth__butlogin}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>
              <button
                className={styles.auth__butregister}
                type="button"
                onClick={handleOpenSignup}
                disabled={loading}
              >
                Зарегистрироваться
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
