'use client';

import React, { useState } from 'react';
import styles from './AddCourseButton.module.css';
import { addCourseToUser, removeCourseFromUser } from '@/app/api/simple-api';
import { useRouter } from 'next/navigation';

interface AddCourseButtonProps {
  courseId: string;
  isAdded: boolean;
  courseName: string;
}

const AddCourseButton: React.FC<AddCourseButtonProps> = ({
  courseId,
  isAdded,
  courseName,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(isAdded);
  const router = useRouter();

  const handleAddCourse = async () => {
    setLoading(true);
    setError(null);

    try {
      await addCourseToUser(courseId);
      setAdded(true);
      // Обновляем страницу для синхронизации данных
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка при добавлении курса');
      console.error('Ошибка добавления курса:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCourse = async () => {
    setLoading(true);
    setError(null);

    try {
      await removeCourseFromUser(courseId);
      setAdded(false);
      // Обновляем страницу для синхронизации данных
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка при удалении курса');
      console.error('Ошибка удаления курса:', err);
    } finally {
      setLoading(false);
    }
  };

  if (added) {
    return (
      <div className={styles.container}>
        <button
          onClick={handleRemoveCourse}
          disabled={loading}
          className={`${styles.button} ${styles.removeButton}`}
        >
          {loading ? 'Удаление...' : '✓ Курс добавлен'}
        </button>
        <p className={styles.description}>
          Курс "{courseName}" добавлен в вашу библиотеку
        </p>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        onClick={handleAddCourse}
        disabled={loading}
        className={`${styles.button} ${styles.addButton}`}
      >
        {loading ? 'Добавление...' : '+ Добавить в мои курсы'}
      </button>
      <p className={styles.description}>
        Добавьте курс "{courseName}" чтобы начать обучение
      </p>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default AddCourseButton;
