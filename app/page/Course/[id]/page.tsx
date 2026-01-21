// app/page/Course/[id]/page.tsx
'use client';

import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import SkillCard from '@/app/components/SkillCard/SkillCard';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isAuthenticated } from '@/app/api/auth';
import {
  getCourseById,
  getCurrentUser,
  addCourseToUser,
  removeCourseFromUser,
  resetCourseProgress,
} from '@/app/api/simple-api';

interface CourseDetails {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
  workouts: string[];
}

interface UserResponse {
  user: {
    _id: string;
    email: string;
    selectedCourses: string[];
    courseProgress: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export default function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [removingCourse, setRemovingCourse] = useState(false);
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [courseId, setCourseId] = useState<string>('');
  const [checkingCourseStatus, setCheckingCourseStatus] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Получаем query-параметры из URL
  const imageUrl = searchParams?.get('imageUrl');
  const backgroundColor = searchParams?.get('backgroundColor');
  const imageWidth = searchParams?.get('imageWidth');
  const imageHeight = searchParams?.get('imageHeight');
  const imageTop = searchParams?.get('imageTop');
  const imageRight = searchParams?.get('imageRight');

  // Получаем ID курса из параметров
  useEffect(() => {
    const getCourseId = async () => {
      const { id } = await params;
      setCourseId(id);
      console.log('ID курса из URL:', id);
    };
    getCourseId();
  }, [params]);

  // Функция для загрузки данных пользователя
  const fetchUserData = async (): Promise<UserResponse | null> => {
    try {
      if (!isAuthenticated()) {
        console.log('Пользователь не авторизован');
        return null;
      }

      console.log('Загружаю данные пользователя...');
      const userResponse = (await getCurrentUser()) as UserResponse;
      console.log('Данные пользователя загружены:', {
        email: userResponse.user?.email,
        selectedCoursesCount: userResponse.user?.selectedCourses?.length || 0,
        selectedCourses: userResponse.user?.selectedCourses,
      });

      return userResponse;
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      // Если ошибка 401 (не авторизован), очищаем токен
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new Event('authStateChanged'));
      }
      return null;
    }
  };

  // Загружаем данные курса и пользователя
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setCheckingCourseStatus(true);

        if (!courseId) return;

        // 1. Загружаем данные курса
        console.log('Загружаю данные курса...');
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
        console.log('Данные курса загружены:', {
          id: courseData._id,
          name: courseData.nameRU,
        });

        // 2. Загружаем данные пользователя
        const userResponse = await fetchUserData();
        setUserData(userResponse);

        if (userResponse && courseData) {
          const isCourseAdded =
            userResponse.user?.selectedCourses?.includes(courseData._id) ||
            false;
          console.log('Статус курса у пользователя:', {
            courseId: courseData._id,
            courseName: courseData.nameRU,
            isCourseAdded: isCourseAdded,
            userCourses: userResponse.user?.selectedCourses,
          });
        }
      } catch (err: any) {
        console.error('Error loading data:', err);

        if (err.message?.includes('404')) {
          setError('Курс не найден');
        } else if (err.message?.includes('400')) {
          setError('Неверный запрос. Проверьте ID курса.');
        } else {
          setError(err.message || 'Ошибка при загрузке данных');
        }
      } finally {
        setLoading(false);
        setCheckingCourseStatus(false);
      }
    };

    if (courseId) {
      loadAllData();
    }
  }, [courseId]);

  // Слушаем события обновления данных пользователя
  useEffect(() => {
    const handleUserDataUpdated = async () => {
      console.log('Событие userDataUpdated получено, обновляю данные...');
      if (isAuthenticated() && courseId && course) {
        try {
          const userResponse = await fetchUserData();
          setUserData(userResponse);

          if (userResponse && course) {
            const isCourseAdded =
              userResponse.user?.selectedCourses?.includes(course._id) || false;
            console.log('Данные пользователя обновлены после события:', {
              courseId: course._id,
              isCourseAdded: isCourseAdded,
            });
          }
        } catch (err) {
          console.error('Ошибка обновления данных пользователя:', err);
        }
      }
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdated);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
    };
  }, [courseId, course]);

  // Проверяем, добавлен ли курс пользователю
  const isCourseAlreadyAdded = (): boolean => {
    if (!userData || !course || !userData.user?.selectedCourses) {
      console.log('Недостаточно данных для проверки:', {
        hasUserData: !!userData,
        hasCourse: !!course,
        hasSelectedCourses: !!userData?.user?.selectedCourses,
      });
      return false;
    }

    const isAdded =
      Array.isArray(userData.user.selectedCourses) &&
      userData.user.selectedCourses.includes(course._id);

    console.log('Проверка курса у пользователя:', {
      courseId: course._id,
      userCourses: userData.user.selectedCourses,
      courseName: course.nameRU,
      isAdded: isAdded,
    });

    return isAdded;
  };

  // Функция для добавления курса
  const addCourseToUserHandler = async () => {
    if (!course) return;

    setAddingCourse(true);
    try {
      const isAuth = isAuthenticated();
      if (!isAuth) {
        alert('Требуется авторизация. Пожалуйста, войдите в систему.');
        router.push('/page/SignIn');
        return;
      }

      console.log(`Добавляю курс ${course._id}...`);

      await addCourseToUser(course._id);
      console.log('Курс добавлен успешно');

      // Обновляем данные пользователя
      const updatedUserData = await fetchUserData();
      setUserData(updatedUserData);
      console.log(
        'Данные пользователя обновлены после добавления курса:',
        updatedUserData?.user?.selectedCourses
      );

      // Отправляем событие для обновления данных в SkillCard
      window.dispatchEvent(new Event('userDataUpdated'));

      alert('Курс успешно добавлен!');
    } catch (err: any) {
      console.error('Ошибка при добавлении курса:', err);

      if (err.message?.includes('401')) {
        alert('Требуется авторизация. Пожалуйста, войдите в систему.');
        router.push('/page/SignIn');
      } else {
        alert(err.message || 'Ошибка при добавлении курса');
      }
    } finally {
      setAddingCourse(false);
    }
  };

  // Функция для удаления курса
  const removeCourseFromUserHandler = async () => {
    if (!course) return;

    if (
      !confirm(
        'Вы уверены, что хотите удалить этот курс? Весь прогресс будет сброшен.'
      )
    ) {
      return;
    }

    setRemovingCourse(true);
    try {
      const isAuth = isAuthenticated();
      if (!isAuth) {
        throw new Error('Требуется авторизация');
      }

      console.log(`Удаляю курс ${course._id}...`);

      // 1. Сначала сбрасываем прогресс курса
      try {
        await resetCourseProgress(course._id);
        console.log(`Прогресс курса ${course._id} сброшен`);
      } catch (resetError) {
        console.warn(
          `Не удалось сбросить прогресс для курса ${course._id}:`,
          resetError
        );
      }

      // 2. Удаляем курс из списка пользователя
      await removeCourseFromUser(course._id);
      console.log('Курс удален успешно');

      // Обновляем данные пользователя
      const updatedUserData = await fetchUserData();
      setUserData(updatedUserData);
      console.log(
        'Данные пользователя обновлены после удаления курса:',
        updatedUserData?.user?.selectedCourses
      );

      // Отправляем событие для обновления данных в SkillCard
      window.dispatchEvent(new Event('userDataUpdated'));

      alert('Курс успешно удален!');
    } catch (err: any) {
      console.error('Ошибка при удалении курса:', err);
      alert(err.message || 'Ошибка при удалении курса');
    } finally {
      setRemovingCourse(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Загрузка курса...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
          Вернуться на главную
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Курс не найден</h2>
        <p>Курс не существует или был удален</p>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none' }}>
          Вернуться на главную
        </Link>
      </div>
    );
  }

  // Декодируем параметры из URL
  const decodedImageUrl = imageUrl
    ? decodeURIComponent(imageUrl)
    : '/img/image_9.png';
  const decodedBackgroundColor = backgroundColor
    ? decodeURIComponent(backgroundColor)
    : '#FF6B6B';
  const decodedImageWidth = imageWidth ? decodeURIComponent(imageWidth) : '58%';
  const decodedImageHeight = imageHeight
    ? decodeURIComponent(imageHeight)
    : '119%';
  const decodedImageTop = imageTop ? decodeURIComponent(imageTop) : '-230px';
  const decodedImageRight = imageRight
    ? decodeURIComponent(imageRight)
    : '-205px';

  // Примерные данные для мотивации
  const motivationPoints = [
    'проработка всех групп мышц',
    'тренировка суставов',
    'улучшение циркуляции крови',
    'упражнения заряжают бодростью',
    'помогают противостоять стрессам',
  ];

  // Проверяем состояние курса
  const courseAdded = isCourseAlreadyAdded();
  const isAuth = isAuthenticated();

  console.log('Текущий статус курса (для рендера):', {
    isAuth: isAuth,
    courseAdded: courseAdded,
    checkingCourseStatus: checkingCourseStatus,
    hasUserData: !!userData,
    courseId: course._id,
    userSelectedCourses: userData?.user?.selectedCourses,
  });

  return (
    <div className={styles.container}>
      {/* SkillCard с синхронизированным состоянием */}
      <SkillCard
        courseName={course.nameRU}
        imageUrl={decodedImageUrl}
        backgroundColor={decodedBackgroundColor}
        imageWidth={decodedImageWidth}
        imageHeight={decodedImageHeight}
        imageTop={decodedImageTop}
        imageRight={decodedImageRight}
        courseId={course._id}
        initialCourseAdded={courseAdded}
        isAuthenticated={isAuth}
        userCourses={userData?.user?.selectedCourses || []}
      />

      <div className={styles.entice}>
        <div>
          <h3 className={styles.entice__title}>Подойдет для вас, если:</h3>
        </div>
        <div className={styles.entice__disBox}>
          {course.fitting && course.fitting.length > 0
            ? course.fitting.map((item, index) => (
                <div key={index} className={styles.entice__dis}>
                  <p className={styles.entice__numb}>{index + 1}</p>
                  <p className={styles.entice__text}>{item}</p>
                </div>
              ))
            : [
                'Давно хотели попробовать, но не решались начать',
                'Хотите укрепить позвоночник, избавиться от болей в спине и суставах',
                'Ищете активность, полезную для тела и души',
              ].map((item, index) => (
                <div key={index} className={styles.entice__dis}>
                  <p className={styles.entice__numb}>{index + 1}</p>
                  <p className={styles.entice__text}>{item}</p>
                </div>
              ))}
        </div>
      </div>

      <div className={styles.Directions}>
        <h3 className={styles.Directions__title}>Направления</h3>
        <div className={styles.Directions__box}>
          {course.directions && course.directions.length > 0 ? (
            course.directions.map((direction, index) => (
              <div key={index} className={styles.Directions__description}>
                <Image
                  width={26}
                  height={26}
                  className={styles.Directions__img}
                  src="/img/Sparcle.svg"
                  alt="Sparcle"
                  priority
                />
                <p className={styles.Directions__text}>{direction}</p>
              </div>
            ))
          ) : (
            <p className={styles.noDirections}>Направления не указаны</p>
          )}
        </div>
      </div>

      <div className={styles.motivation}>
        <div className={styles.motivation__box}>
          <h3 className={styles.motivation__title}>
            Начните путь к новому телу
          </h3>
          <p className={styles.motivation__text}>
            {motivationPoints.map((point, index) => (
              <div key={index}>
                • {point}
                {index < motivationPoints.length - 1 }
              </div>
            ))}
          </p>
          <div className={styles.motivation__but}>
            {checkingCourseStatus ? (
              <div style={{ padding: '10px', textAlign: 'center' }}>
                <div>Проверка статуса курса...</div>
              </div>
            ) : isAuth ? (
              courseAdded ? (
                <div className={styles.courseActions}>
                  <Link
                    href="#"
                    className={styles.removeCourseLink}
                    onClick={(e) => {
                      e.preventDefault();
                      removeCourseFromUserHandler();
                    }}
                  >
                    {removingCourse
                      ? 'Удаление...'
                      : 'Курс уже добавлен, Удалить?'}
                  </Link>
                </div>
              ) : (
                <Link
                  href="#"
                  className={styles.motivation__butLink}
                  onClick={(e) => {
                    e.preventDefault();
                    addCourseToUserHandler();
                  }}
                >
                  {addingCourse ? 'Добавление...' : 'Добавить курс'}
                </Link>
              )
            ) : (
              <Link href="/page/SignIn" className={styles.motivation__butLink}>
                Войдите, чтобы добавить курс
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
    </div>
  );
}
