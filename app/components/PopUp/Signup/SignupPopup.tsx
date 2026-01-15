'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './SignupPopup.module.css';
import {
  register,
  isAuthenticated,
  getCurrentUser,
  login,
} from '@/app/api/auth';
import { getErrorMessage } from '@/app/api/errors';
import { validatePassword, isValidEmail } from '@/app/api/api-utils';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignin: () => void;
  onRegisterSuccess: () => void;
}

export default function SignupPopup({
  isOpen,
  onClose,
  onOpenSignin,
  onRegisterSuccess,
}: AuthPopupProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      if (isAuthenticated()) {
        const user = getCurrentUser();
        console.log('Пользователь уже авторизован:', user?.email);
        onClose();
        onRegisterSuccess();
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

    // Валидация на фронтенде перед отправкой
    const validationErrors: string[] = [];

    // Проверка email
    if (!email.trim()) {
      validationErrors.push('Введите Email');
    } else if (!isValidEmail(email)) {
      validationErrors.push('Введите корректный email адрес');
    }

    // Проверка пароля
    if (!password.trim()) {
      validationErrors.push('Введите пароль');
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        validationErrors.push(...passwordValidation.errors);
      }
    }

    // Проверка подтверждения пароля
    if (!confirmPassword.trim()) {
      validationErrors.push('Повторите пароль');
    } else if (password !== confirmPassword) {
      validationErrors.push('Пароли не совпадают');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Отправляем запрос на регистрацию
      await register(email, password);

      // Пытаемся автоматически войти после регистрации
      try {
        await login(email, password);
        onClose();
        onRegisterSuccess();
      } catch (loginError) {
        console.log('Регистрация успешна, но автоматический вход не удался');
        // Если вход не удался, открываем форму входа
        onClose();
        onOpenSignin();
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      console.error('Ошибка регистрации:', errorMessage);
      setErrors([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSignin = () => {
    onClose();
    onOpenSignin();
  };

  const isInputError = (field: string) => {
    return errors.some(
      (error) =>
        ((error.includes('Email') || error.includes('email')) &&
          field === 'email') ||
        ((error.includes('пароль') ||
          error.includes('Пароль') ||
          error.includes('символов')) &&
          field === 'password') ||
        ((error.includes('Повторите') || error.includes('совпадают')) &&
          field === 'confirmPassword')
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
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
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.auth__Box}>
            <div className={styles.auth__inputBox}>
              <input
                className={`${styles.auth__input} ${isInputError('email') ? styles.inputError : ''}`}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <input
                className={`${styles.auth__input} ${isInputError('password') ? styles.inputError : ''}`}
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <input
                className={`${styles.auth__input} ${isInputError('confirmPassword') ? styles.inputError : ''}`}
                type="password"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
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
                type="button"
                onClick={handleOpenSignin}
                disabled={loading}
              >
                Войти
              </button>
              <button
                className={styles.auth__butregister}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
