'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './SignupPopup.module.css';
import { register, isAuthenticated, getCurrentUser } from '@/app/api/auth';
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
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      if (isAuthenticated()) {
        const user = getCurrentUser();
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
    setSuccessMessage('');

    // Валидация на фронтенде
    const validationErrors: string[] = [];

    if (!email.trim()) {
      validationErrors.push('Введите Email');
    } else if (!isValidEmail(email)) {
      validationErrors.push('Введите корректный email адрес');
    }

    if (!password.trim()) {
      validationErrors.push('Введите пароль');
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        validationErrors.push(...passwordValidation.errors);
      }
    }

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
      // Регистрация
      const result = await register(email, password);

      console.log('Регистрация успешна:', result);

      if (result.message) {
        setSuccessMessage('Регистрация успешна! Теперь войдите в систему.');

        // Очищаем форму
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Через 3 секунды переключаемся на вход
        setTimeout(() => {
          onClose();
          onOpenSignin();
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      console.error('Registration error:', error);
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

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors([]);
    setSuccessMessage('');
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
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

              {successMessage && (
                <div className={styles.successBox}>
                  <div className={styles.successText}>{successMessage}</div>
                </div>
              )}

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
