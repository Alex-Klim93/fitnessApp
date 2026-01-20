// app/page/Course/[id]/MotivationSection.tsx
'use client';

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import {
  useAddCourseToUserMutation,
  useRemoveCourseFromUserMutation,
} from '@/app/api/userApi';
import { useResetCourseProgressMutation } from '@/app/api/coursesApi';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/app/api/auth';
import { useState, useEffect, useCallback } from 'react';
import { isCourseAddedByUser } from '@/app/utils/courseUtils';

interface MotivationSectionProps {
  courseId: string;
  courseName: string;
  userData: any;
}

export default function MotivationSection({
  courseId,
  courseName,
  userData,
}: MotivationSectionProps) {
  const router = useRouter();
  const [addingCourse, setAddingCourse] = useState(false);
  const [removingCourse, setRemovingCourse] = useState(false);
  const [authState, setAuthState] = useState(false);
  const [courseAdded, setCourseAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [addCourse] = useAddCourseToUserMutation();
  const [removeCourse] = useRemoveCourseFromUserMutation();
  const [resetProgress] = useResetCourseProgressMutation();

  // Функция проверки статуса курса
  const checkCourseStatus = useCallback(async () => {
    const auth = isAuthenticated();
    setAuthState(auth);

    if (auth) {
      try {
        // Используем утилиту для проверки курса у пользователя
        const isAdded = await isCourseAddedByUser(courseId);
        setCourseAdded(isAdded);
      } catch (error) {
        console.error('Ошибка при проверке курса:', error);
        // Fallback: проверяем по userData из пропсов
        const isAdded =
          userData?.user?.selectedCourses?.includes(courseId) || false;
        setCourseAdded(isAdded);
      }
    } else {
      setCourseAdded(false);
    }

    setLoading(false);
  }, [courseId, userData]);

  // Инициализация при загрузке компонента
  useEffect(() => {
    checkCourseStatus();
  }, [checkCourseStatus]);

  // Слушаем события изменения авторизации
  useEffect(() => {
    const handleAuthChange = () => {
      checkCourseStatus();
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [checkCourseStatus]);

  // Слушаем события изменения курсов
  useEffect(() => {
    const handleCourseChange = () => {
      checkCourseStatus();
    };

    window.addEventListener('courseStateChanged', handleCourseChange);

    return () => {
      window.removeEventListener('courseStateChanged', handleCourseChange);
    };
  }, [checkCourseStatus]);

  const addCourseToUserHandler = async () => {
    if (!authState) {
      alert('Требуется авторизация. Пожалуйста, войдите в систему.');
      router.push('/page/SignIn');
      return;
    }

    setAddingCourse(true);
    try {
      await addCourse(courseId).unwrap();
      alert('Курс успешно добавлен!');

      // Обновляем состояние
      setCourseAdded(true);

      // Уведомляем другие компоненты
      window.dispatchEvent(new Event('courseStateChanged'));

      // Обновляем данные страницы
      router.refresh();
    } catch (err: any) {
      console.error('Ошибка при добавлении курса:', err);
      alert(err.data?.message || 'Ошибка при добавлении курса');
    } finally {
      setAddingCourse(false);
    }
  };

  const removeCourseFromUserHandler = async () => {
    if (
      !confirm(
        'Вы уверены, что хотите удалить этот курс? Весь прогресс будет сброшен.'
      )
    ) {
      return;
    }

    setRemovingCourse(true);
    try {
      await resetProgress(courseId).unwrap();
      await removeCourse(courseId).unwrap();
      alert('Курс успешно удален!');

      // Обновляем состояние
      setCourseAdded(false);

      // Уведомляем другие компоненты
      window.dispatchEvent(new Event('courseStateChanged'));

      // Обновляем данные страницы
      router.refresh();
    } catch (err: any) {
      console.error('Ошибка при удалении курса:', err);
      alert(err.data?.message || 'Ошибка при удалении курса');
    } finally {
      setRemovingCourse(false);
    }
  };

  const motivationPoints = [
    'проработка всех групп мышц',
    'тренировка суставов',
    'улучшение циркуляции крови',
    'упражнения заряжают бодростью',
    'помогают противостоять стрессам',
  ];

  // Показываем загрузку
  if (loading) {
    return (
      <div className={styles.motivation}>
        <div className={styles.motivation__box}>
          <div className={styles.motivation__text}>
            Проверка статуса курса...
          </div>
        </div>
      </div>
    );
  }

  // Определяем состояние кнопки
  let buttonText = '';
  let buttonLink = '#';
  let buttonOnClick:
    | ((e: React.MouseEvent<HTMLAnchorElement>) => void)
    | undefined;
  let buttonClassName = '';

  if (!authState) {
    // Не авторизован
    buttonText = 'Войдите, чтобы добавить курс';
    buttonLink = '/page/SignIn';
    buttonClassName = styles.motivation__butLink;
  } else if (courseAdded) {
    // Авторизован, курс уже добавлен
    buttonText = removingCourse ? 'Удаление...' : 'Курс уже добавлен, Удалить?';
    buttonLink = '#';
    buttonOnClick = (e) => {
      e.preventDefault();
      removeCourseFromUserHandler();
    };
    buttonClassName = styles.removeCourseLink;
  } else {
    // Авторизован, курс не добавлен
    buttonText = addingCourse ? 'Добавление...' : 'Добавить курс';
    buttonLink = '#';
    buttonOnClick = (e) => {
      e.preventDefault();
      addCourseToUserHandler();
    };
    buttonClassName = styles.motivation__butLink;
  }

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
          {buttonOnClick ? (
            <Link
              href={buttonLink}
              className={buttonClassName}
              onClick={buttonOnClick}
            >
              {buttonText}
            </Link>
          ) : (
            <Link href={buttonLink} className={buttonClassName}>
              {buttonText}
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
