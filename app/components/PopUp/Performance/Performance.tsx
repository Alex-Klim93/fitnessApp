// app/components/ProfilePopup/ProfilePopup.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './Performance.module.css';
import { logout } from '@/app/api/auth';
import Image from 'next/image';

interface PerformanceProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  loginName: string;
  onLogout?: () => void; // Опциональный callback для родительского компонента
}

export default function Performance({
  isOpen,
  onClose,
  userEmail,
  loginName,
  onLogout,
}: PerformanceProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLogoutClick = () => {
    // Вызываем функцию выхода
    logout();

    // Вызываем callback если есть (для родительского компонента)
    if (onLogout) {
      onLogout();
    }

    // Закрываем попап
    onClose();

    // Принудительно перезагружаем страницу для обновления состояния
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <p className={styles.Performance__title}>Ваш прогресс засчитан!</p>
        <Image
          width={68}
          height={68}
          className={styles.Performance__image}
          src="/img/Check-in-Circle.svg"
          alt="logo"
          priority
        />
      </div>
    </div>
  );
}
