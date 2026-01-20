// app/components/ProfilePopup/ProfilePopup.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './ProgressPopup.module.css';
import { saveWorkoutProgress } from '@/app/api/simple-api';

interface ProgressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  loginName: string;
  onLogout?: () => void;
  courseId: string;
  workoutId: string;
  exercises: Array<{
    name: string;
    quantity: number;
    _id: string;
  }>;
  currentProgress: number[];
  onProgressSaved: (newProgress: number[]) => void;
}

export default function ProgressPopup({
  isOpen,
  onClose,
  courseId,
  workoutId,
  exercises,
  currentProgress,
  onProgressSaved,
}: ProgressPopupProps) {
  const [progressData, setProgressData] = useState<number[]>(currentProgress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setProgressData(currentProgress);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, currentProgress]);

  const handleProgressChange = (index: number, value: number) => {
    const newProgress = [...progressData];
    const maxQuantity = exercises[index]?.quantity || 0;
    newProgress[index] = Math.max(0, Math.min(value, maxQuantity));
    setProgressData(newProgress);
  };

  const saveProgress = async () => {
    if (!courseId || !workoutId) {
      alert('Отсутствует ID курса или тренировки');
      return;
    }

    setSaving(true);

    try {
      await saveWorkoutProgress(courseId, workoutId, progressData);
      onProgressSaved(progressData);
      alert('Прогресс успешно сохранен!');
      onClose();
    } catch (err: any) {
      console.error('Ошибка сохранения прогресса:', err);
      alert(err.message || 'Ошибка при сохранении прогресса');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup}>
        <p className={styles.title}>Мой прогресс</p>
        <div className={styles.progress__box}>
          <div className={styles.progress__list}>
            {exercises.map((exercise, index) => (
              <div
                key={exercise._id || index}
                className={styles.progress__element}
              >
                <p className={styles.progress__description}>
                  Сколько раз вы сделали {exercise.name}?
                </p>
                <input
                  type="number"
                  min="0"
                  max={exercise.quantity}
                  value={progressData[index] || 0}
                  onChange={(e) =>
                    handleProgressChange(index, parseInt(e.target.value) || 0)
                  }
                  className={styles.progress}
                />
              </div>
            ))}
          </div>
          <div className={styles.progress__but}>
            <button
              onClick={saveProgress}
              className={styles.saveButton}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
