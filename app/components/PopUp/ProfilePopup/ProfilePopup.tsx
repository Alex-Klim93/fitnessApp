// app/components/ProfilePopup/ProfilePopup.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './ProfilePopup.module.css';
import { logout } from '@/app/api/auth';

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  loginName: string;
  onLogout?: () => void; // Опциональный callback для родительского компонента
}

export default function ProfilePopup({
  isOpen,
  onClose,
  userEmail,
  loginName,
  onLogout,
}: ProfilePopupProps) {
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

  };

  return (
    <div className={styles.window}>
      <div className={styles.overlay} onClick={handleOverlayClick}>
        <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
          <div className={styles.profileHeader}>
            <div className={styles.loginName}>{loginName}</div>
            <div className={styles.userEmail}>{userEmail}</div>
          </div>

          <div className={styles.menuItems}>
            <Link
              href="/page/Profile"
              className={styles.menuItem__profil}
              onClick={onClose}
            >
              Мой профиль
            </Link>
            <button
              className={styles.menuItem__exit}
              onClick={handleLogoutClick}
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
