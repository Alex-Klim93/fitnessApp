// app/components/Сourses.tsx
'use client';

import Image from 'next/image';
import styles from './Сourses.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAllCourses, getCourseById } from '@/app/api/simple-api';

interface CourseCardData {
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

// Массив с URL изображений для карточек
const courseImages = [
  '/img/image9.png', // Йога
  '/img/image 5.png', // Стретчинг
  '/img/Untitled-1 1.png', // Фитнес
  '/img/image 7.png', // Степ-аэробика
  '/img/image 8.png', // Бодифлекс
];

// Массив с цветами для карточек
const courseColors = ['#FFC700', '#2491D2', '#F7A012', '#FF7E65', '#7D458C'];

// Массив с ширинами для каждой картинки
const courseImageWidths = ['58%', '87%', '58%', '58%', '58%'];

// Массив с высотами для каждой картинки
const courseImageHeights = ['146%', '113%', '119%', '119%', '119%'];

// Массив с отступом top для каждой картинки
const courseImageTops = ['-125px', '-33px', '-50px', '-230px', '-230px'];

// Массив с отступом right для каждой картинки
const courseImageRights = ['-48px', '-215px', '-65px', '-205px', '-205px'];

// Функция для получения изображения по названию курса
const getCourseImage = (courseName: string): number => {
  const name = courseName.toLowerCase();

  if (name.includes('йога') || name.includes('yoga')) {
    return 0; // Йога
  } else if (name.includes('стретчинг') || name.includes('stretching')) {
    return 1; // Стретчинг
  } else if (name.includes('фитнес') || name.includes('fitness')) {
    return 2; // Фитнес
  } else if (
    name.includes('степ') ||
    name.includes('step') ||
    name.includes('аэробик') ||
    name.includes('aerobics')
  ) {
    return 3; // Степ-аэробика
  } else if (name.includes('бодифлекс') || name.includes('bodyflex')) {
    return 4; // Бодифлекс
  }

  // По умолчанию возвращаем индекс для йоги
  return 0;
};

// Функция для определения уровня сложности
const getDifficultyLevel = (difficulty: string): number => {
  const difficultyLower = difficulty.toLowerCase();

  if (difficultyLower.includes('легк') || difficultyLower.includes('начина')) {
    return 1;
  } else if (
    difficultyLower.includes('низк') ||
    difficultyLower.includes('начал')
  ) {
    return 1;
  } else if (difficultyLower.includes('средн')) {
    return 3;
  } else if (
    difficultyLower.includes('сложн') ||
    difficultyLower.includes('продви')
  ) {
    return 5;
  } else if (
    difficultyLower.includes('эксперт') ||
    difficultyLower.includes('профес')
  ) {
    return 5;
  } else if (difficultyLower.includes('высок')) {
    return 4;
  }

  // По умолчанию средняя сложность
  return 3;
};

// Ключи для кэширования
const CACHE_KEY = 'courses_full_cache';
const CACHE_TIMESTAMP_KEY = 'courses_full_cache_timestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

export default function Сourses() {
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCoursesWithDetails = async () => {
      try {
        setLoading(true);

        // Проверяем кэш
        if (typeof window !== 'undefined') {
          const cachedData = localStorage.getItem(CACHE_KEY);
          const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

          if (cachedData && cachedTimestamp) {
            const cacheAge = Date.now() - parseInt(cachedTimestamp);
            if (cacheAge < CACHE_DURATION) {
              setCourses(JSON.parse(cachedData));
              setLoading(false);
              return;
            }
          }
        }

        // 1. Получаем список всех курсов
        const basicCoursesList = await getAllCourses();

        if (!Array.isArray(basicCoursesList) || basicCoursesList.length === 0) {
          setCourses([]);
          setLoading(false);
          return;
        }

        // 2. Для каждого курса получаем детальную информацию
        const detailedCoursesPromises = basicCoursesList.map(
          async (course: any) => {
            try {
              const courseData = await getCourseById(course._id);
              return courseData;
            } catch (err) {
              console.error(
                `Error fetching details for course ${course._id}:`,
                err
              );
              // Если не удалось получить детали, используем базовые данные
              return {
                ...course,
                difficulty: 'средняя',
                durationInDays: 25,
                dailyDurationInMinutes: { from: 20, to: 50 },
              };
            }
          }
        );

        const detailedCoursesList = await Promise.all(detailedCoursesPromises);

        // Сохраняем в кэш
        if (typeof window !== 'undefined') {
          localStorage.setItem(CACHE_KEY, JSON.stringify(detailedCoursesList));
          localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        }

        setCourses(detailedCoursesList);
      } catch (err: any) {
        console.error('Ошибка при загрузке курсов:', err);

        // Пробуем использовать кэш
        if (typeof window !== 'undefined') {
          const cachedData = localStorage.getItem(CACHE_KEY);
          if (cachedData) {
            setCourses(JSON.parse(cachedData));
          } else {
            setError(err.message || 'Ошибка при загрузке курсов');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllCoursesWithDetails();
  }, []);

  if (loading) {
    return (
      <div className={styles.courses__box}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #0070f3',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          ></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.courses__box}>
        <div className={styles.error}>Ошибка: {error}</div>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Обновить страницу
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className={styles.courses__box}>
        <div className={styles.empty}>Курсы не найдены</div>
      </div>
    );
  }

  return (
    <div className={styles.courses__box}>
      {courses.map((course, index) => {
        // Получаем индекс изображения по названию курса
        const imageIndex = getCourseImage(course.nameRU);

        const imageUrl = courseImages[imageIndex];
        const backgroundColor = courseColors[imageIndex];
        const imageWidth = courseImageWidths[imageIndex];
        const imageHeight = courseImageHeights[imageIndex];
        const imageTop = courseImageTops[imageIndex];
        const imageRight = courseImageRights[imageIndex];

        // Используем реальные данные из API
        const durationText = course.durationInDays
          ? `${course.durationInDays} дней`
          : '25 дней';
        const dailyDurationText = course.dailyDurationInMinutes
          ? `${course.dailyDurationInMinutes.from}-${course.dailyDurationInMinutes.to} мин/день`
          : '20-50 мин/день';
        const difficultyText = course.difficulty || 'Средняя';

        // Определяем уровень сложности для SVG
        const difficultyLevel = getDifficultyLevel(difficultyText);

        return (
          <Link
            key={course._id}
            href={{
              pathname: `/page/Course/${course._id}`,
              query: {
                imageUrl: encodeURIComponent(imageUrl),
                backgroundColor: encodeURIComponent(backgroundColor),
                imageWidth: encodeURIComponent(imageWidth),
                imageHeight: encodeURIComponent(imageHeight),
                imageTop: encodeURIComponent(imageTop),
                imageRight: encodeURIComponent(imageRight),
              },
            }}
            className={styles.courses__cardLink}
          >
            <article className={styles.courses__card}>
              <div className={styles.courses__imgBox}>
                <Image
                  width={360}
                  height={325}
                  className={styles.courses__image}
                  src={imageUrl}
                  alt={course.nameRU}
                  priority
                />
                <div>
                  <Image
                    width={32}
                    height={32}
                    className={styles.courses__imageSvg}
                    src="/img/Circle.svg"
                    alt="Circle"
                    priority
                  />
                </div>
              </div>
              <div className={styles.courses__descrip}>
                <h3 className={styles.courses__title}>{course.nameRU}</h3>
                <div className={styles.courses__periodBox}>
                  <div className={styles.courses__period}>
                    <div className={styles.courses__days}>
                      <Image
                        width={18}
                        height={18}
                        className={styles.courses__daysImg}
                        src="/img/Calendar.svg"
                        alt="Calendar"
                        priority
                      />
                      <p className={styles.courses__daysDisc}>{durationText}</p>
                    </div>
                    <div className={styles.courses__minDay}>
                      <Image
                        width={18}
                        height={18}
                        className={styles.courses__minDayImg}
                        src="/img/Time.svg"
                        alt="Time"
                        priority
                      />
                      <p className={styles.courses__minDayDisc}>
                        {dailyDurationText}
                      </p>
                    </div>
                    <div className={styles.courses__complexity}>
                      {/* SVG для отображения уровня сложности (как в MyCourses) */}
                      <svg
                        viewBox="0 0 18 18"
                        width="18"
                        height="18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Столбец 1 (самый высокий) - заполняется если сложность >= 1 */}
                        <path
                          d="M15 2.625C15.2984 2.625 15.5845 2.74353 15.7955 2.9545C16.0065 3.16548 16.125 3.45163 16.125 3.75L16.125 14.25C16.125 14.5484 16.0065 14.8345 15.7955 15.0455C15.5845 15.2565 15.2984 15.375 15 15.375C14.7016 15.375 14.4155 15.2565 14.2045 15.0455C13.9935 14.8345 13.875 14.5484 13.875 14.25L13.875 3.75C13.875 3.45163 13.9935 3.16548 14.2045 2.9545C14.4155 2.74353 14.7016 2.625 15 2.625Z"
                          fill={
                            difficultyLevel >= 5
                              ? 'rgb(0,193,255)'
                              : 'rgb(217,217,217)'
                          }
                          fillRule="evenodd"
                        />
                        {/* Столбец 2 - заполняется если сложность >= 2 */}
                        <path
                          d="M12 4.875C12.2984 4.875 12.5845 4.99353 12.7955 5.2045C13.0065 5.41548 13.125 5.70163 13.125 6L13.125 14.25C13.125 14.5484 13.0065 14.8345 12.7955 15.0455C12.5845 15.2565 12.2984 15.375 12 15.375C11.7016 15.375 11.4155 15.2565 11.2045 15.0455C10.9935 14.8345 10.875 14.5484 10.875 14.25L10.875 6C10.875 5.70163 10.9935 5.41548 11.2045 5.2045C11.4155 4.99353 11.7016 4.875 12 4.875Z"
                          fill={
                            difficultyLevel >= 4
                              ? 'rgb(0,193,255)'
                              : 'rgb(217,217,217)'
                          }
                          fillRule="evenodd"
                        />
                        {/* Столбец 3 (средний) - заполняется если сложность >= 3 */}
                        <path
                          d="M9 7.125C9.29837 7.125 9.58452 7.24353 9.7955 7.4545C10.0065 7.66548 10.125 7.95163 10.125 8.25L10.125 14.25C10.125 14.5484 10.0065 14.8345 9.7955 15.0455C9.58452 15.2565 9.29837 15.375 9 15.375C8.70163 15.375 8.41548 15.2565 8.2045 15.0455C7.99353 14.8345 7.875 14.5484 7.875 14.25L7.875 8.25C7.875 7.95163 7.99353 7.66548 8.2045 7.4545C8.41548 7.24353 8.70163 7.125 9 7.125Z"
                          fill={
                            difficultyLevel >= 3
                              ? 'rgb(0,193,255)'
                              : 'rgb(217,217,217)'
                          }
                          fillRule="evenodd"
                        />
                        {/* Столбец 4 - заполняется если сложность >= 4 */}
                        <path
                          d="M6 9.375C6.29837 9.375 6.58452 9.49353 6.7955 9.7045C7.00647 9.91548 7.125 10.2016 7.125 10.5L7.125 14.25C7.125 14.5484 7.00647 14.8345 6.7955 15.0455C6.58452 15.2565 6.29837 15.375 6 15.375C5.70163 15.375 5.41548 15.2565 5.2045 15.0455C4.99353 14.8345 4.875 14.5484 4.875 14.25L4.875 10.5C4.875 10.2016 4.99353 9.91548 5.2045 9.7045C5.41548 9.49353 5.70163 9.375 6 9.375Z"
                          fill={
                            difficultyLevel >= 2
                              ? 'rgb(0,193,255)'
                              : 'rgb(217,217,217)'
                          }
                          fillRule="evenodd"
                        />
                        {/* Столбец 5 (самый низкий) - заполняется если сложность >= 5 */}
                        <path
                          d="M3 11.625C3.29837 11.625 3.58452 11.7435 3.7955 11.9545C4.00647 12.1655 4.125 12.4516 4.125 12.75L4.125 14.25C4.125 14.5484 4.00647 14.8345 3.7955 15.0455C3.58452 15.2565 3.29837 15.375 3 15.375C2.70163 15.375 2.41548 15.2565 2.2045 15.0455C1.99353 14.8345 1.875 14.5484 1.875 14.25L1.875 12.75C1.875 12.4516 1.99353 12.1655 2.2045 11.9545C2.41548 11.7435 2.70163 11.625 3 11.625Z"
                          fill={
                            difficultyLevel >= 1
                              ? 'rgb(0,193,255)'
                              : 'rgb(217,217,217)'
                          }
                          fillRule="evenodd"
                        />
                      </svg>
                      <p className={styles.courses__complexityDisc}>
                        {difficultyText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
