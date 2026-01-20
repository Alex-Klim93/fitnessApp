// app/page/Course/[id]/page.tsx
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import SkillCard from '@/app/components/SkillCard/SkillCard';
import {
  fetchCoursesStatic,
  fetchCourseStatic,
  fetchUserDataServerSide,
} from '@/app/ssr/serverUtils';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

interface Course {
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

// Ленивая загрузка динамических секций
const MotivationSection = dynamic(() => import('./MotivationSection'), {
  loading: () => <div>Загрузка...</div>,
});

// Генерация статических путей
export async function generateStaticParams() {
  const courses: Course[] = (await fetchCoursesStatic()) as Course[];
  return courses.map((course: Course) => ({
    id: course._id,
  }));
}

// ISR: перевалидация каждый час
export const revalidate = 3600;

interface CoursePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CoursePage({
  params,
  searchParams,
}: CoursePageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  // Параллельная загрузка критичных данных
  const [course, userData] = await Promise.all([
    fetchCourseStatic(id) as Promise<Course>,
    fetchUserDataServerSide(),
  ]);

  // Декодирование параметров из URL
  const imageUrl = resolvedSearchParams?.imageUrl
    ? decodeURIComponent(resolvedSearchParams.imageUrl as string)
    : '/img/image_9.png';
  const backgroundColor = resolvedSearchParams?.backgroundColor
    ? decodeURIComponent(resolvedSearchParams.backgroundColor as string)
    : '#FF6B6B';
  const imageWidth = resolvedSearchParams?.imageWidth
    ? decodeURIComponent(resolvedSearchParams.imageWidth as string)
    : '58%';
  const imageHeight = resolvedSearchParams?.imageHeight
    ? decodeURIComponent(resolvedSearchParams.imageHeight as string)
    : '119%';
  const imageTop = resolvedSearchParams?.imageTop
    ? decodeURIComponent(resolvedSearchParams.imageTop as string)
    : '-230px';
  const imageRight = resolvedSearchParams?.imageRight
    ? decodeURIComponent(resolvedSearchParams.imageRight as string)
    : '-205px';

  return (
    <div>
      {/* Above-the-fold контент */}
      <SkillCard
        courseName={course.nameRU}
        imageUrl={imageUrl}
        backgroundColor={backgroundColor}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        imageTop={imageTop}
        imageRight={imageRight}
      />

      <div className={styles.entice}>
        <h3 className={styles.entice__title}>Подойдет для вас, если:</h3>
        <div className={styles.entice__disBox}>
          {course.fitting && course.fitting.length > 0
            ? course.fitting.map((item: string, index: number) => (
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
            course.directions.map((direction: string, index: number) => (
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

      {/* Ниже-the-fold контент с ленивой загрузкой */}
      <Suspense fallback={<div>Загрузка...</div>}>
        <MotivationSection
          courseId={id} // Передаем id курса
          courseName={course.nameRU}
          userData={userData}
        />
      </Suspense>
    </div>
  );
}
