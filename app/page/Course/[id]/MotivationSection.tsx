// app/page/Course/[id]/MotivationSection.tsx
'use client';

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  useAddCourseToUserMutation,
  useRemoveCourseFromUserMutation,
  useGetCurrentUserQuery,
} from '@/app/api/userApi';
import { useResetCourseProgressMutation } from '@/app/api/coursesApi';

interface MotivationSectionProps {
  courseId: string;
  courseName: string;
}

export default function MotivationSection({
  courseId,
  courseName,
}: MotivationSectionProps) {
  const router = useRouter();

  // Проверяем авторизацию
  const isAuthenticated =
    typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

  // RTK Query хуки
  const {
    data: user,
    isLoading: userLoading,
    refetch,
  } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [addCourse, { isLoading: addingCourse }] = useAddCourseToUserMutation();
  const [removeCourse, { isLoading: removingCourse }] =
    useRemoveCourseFromUserMutation();
  const [resetProgress, { isLoading: resettingProgress }] =
    useResetCourseProgressMutation();

  // Проверяем, добавлен ли курс пользователю
  const isCourseAdded = user?.selectedCourses?.includes(courseId) || false;

  // Обработчик добавления курса
  const handleAddCourse = async () => {
    if (!isAuthenticated) {
      router.push('/page/SignIn');
      return;
    }

    try {
      await addCourse(courseId).unwrap();
      // После успешного добавления обновляем данные пользователя
      await refetch();
    } catch (error) {
      console.error('Ошибка при добавлении курса:', error);
      alert('Не удалось добавить курс. Попробуйте еще раз.');
    }
  };

  // Обработчик удаления курса
  const handleRemoveCourse = async () => {
    if (
      !confirm(
        'Вы уверены, что хотите удалить этот курс? Весь прогресс будет сброшен.'
      )
    ) {
      return;
    }

    try {
      // Сначала сбрасываем прогресс
      await resetProgress(courseId).unwrap();
      // Затем удаляем курс
      await removeCourse(courseId).unwrap();
      // Обновляем данные пользователя
      await refetch();
    } catch (error) {
      console.error('Ошибка при удалении курса:', error);
      alert('Не удалось удалить курс. Попробуйте еще раз.');
    }
  };

  // Определяем состояние кнопки
  const getButtonState = () => {
    // Если идет загрузка данных пользователя
    if (isAuthenticated && userLoading) {
      return {
        text: 'Загрузка...',
        className: styles.motivation__butLink,
        onClick: undefined,
        href: '#',
        disabled: true,
      };
    }

    // Если не авторизован
    if (!isAuthenticated) {
      return {
        text: 'Войдите, чтобы добавить курс',
        className: styles.motivation__butLink,
        onClick: undefined,
        href: '/page/SignIn',
        disabled: false,
      };
    }

    // Если курс уже добавлен
    if (isCourseAdded) {
      return {
        text:
          removingCourse || resettingProgress
            ? 'Удаление...'
            : 'Курс уже добавлен, Удалить?',
        className: styles.removeCourseLink,
        onClick: handleRemoveCourse,
        href: '#',
        disabled: removingCourse || resettingProgress,
      };
    }

    // Если курс не добавлен
    return {
      text: addingCourse ? 'Добавление...' : 'Добавить курс',
      className: styles.motivation__butLink,
      onClick: handleAddCourse,
      href: '#',
      disabled: addingCourse,
    };
  };

  const buttonState = getButtonState();
  const isLoading =
    (isAuthenticated && userLoading) ||
    addingCourse ||
    removingCourse ||
    resettingProgress;

  const motivationPoints = [
    'проработка всех групп мышц',
    'тренировка суставов',
    'улучшение циркуляции крови',
    'упражнения заряжают бодростью',
    'помогают противостоять стрессам',
  ];

  return (
    <div className={styles.motivation}>
      <div className={styles.motivation__box}>
        <h3 className={styles.motivation__title}>Начните путь к новому телу</h3>
        <p className={styles.motivation__text}>
          {motivationPoints.map((point, index) => (
            <span key={index}>
              • {point}
              {index < motivationPoints.length - 1 && <br />}
            </span>
          ))}
        </p>
        <div className={styles.motivation__but}>
          {isLoading ? (
            <div
              className={styles.motivation__butLink}
              style={{ opacity: 0.7 }}
            >
              {buttonState.text}
            </div>
          ) : buttonState.onClick ? (
            <Link
              href={buttonState.href}
              className={buttonState.className}
              onClick={(e) => {
                e.preventDefault();
                buttonState.onClick!();
              }}
            >
              {buttonState.text}
            </Link>
          ) : (
            <Link href={buttonState.href} className={buttonState.className}>
              {buttonState.text}
            </Link>
          )}
        </div>
      </div>
      <Image
        width={670.18}
        height={390.98}
        className={styles.motivation__imgSvg2}
        src="/img/Vector 6084.svg"
        alt="Sparcle"
        priority
      />
      <Image
        width={50}
        height={42.5}
        className={styles.motivation__imgSvg1}
        src="/img/Vector 6094.svg"
        alt="Sparcle"
        priority
      />
      <Image
        width={547}
        height={566}
        className={styles.motivation__img}
        src="/img/skypro_mid23_Crouching_man_in_green_polo_shirt_and_navy_shorts__934c6a97-07c8-4c5b-9487-96389d003dfd Background Removed 2.png"
        alt="Sparcle"
        priority
      />
    </div>
  );
}
