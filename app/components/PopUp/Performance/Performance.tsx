// app/components/Performance/Performance.tsx
'use client';

import { useEffect } from 'react';
import styles from './Performance.module.css';
import Image from 'next/image';

interface PerformanceProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  loginName: string;
  onLogout?: () => void;
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