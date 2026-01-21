// app/components/MyCourses/MyСourses.tsx
'use client';

import Image from 'next/image';
import styles from './MyСourses.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/app/api/auth';
import { getErrorMessage } from '@/app/api/errors';
import LessonMaterials from '../PopUp/LessonMaterials/LessonMaterials';
import { useRemoveCourseFromUserMutation } from '@/app/api/userApi';
import { useResetCourseProgressMutation } from '@/app/api/coursesApi';
import { useGetUserProgressQuery } from '@/app/api/progressApi';
import { useGetCourseWorkoutsQuery } from '@/app/api/coursesApi';
import { Suspense } from 'react';
import { getUserValidCourses } from '@/app/utils/userCourseUtils';

interface Exercise {
  _id: string;
  name: string;
  quantity: number;
}

interface Workout {
  _id: string;
  name: string;
  exercises: Exercise[];
}

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

interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

interface CourseProgress {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
}

const courseImages = [
  '/img/image9.png',
  '/img/image 5.png',
  '/img/Untitled-1 1.png',
  '/img/image 7.png',
  '/img/image 8.png',
];

const getCourseImage = (courseName: string): string => {
  const name = courseName.toLowerCase();
  if (name.includes('йога') || name.includes('yoga')) return courseImages[0];
  if (name.includes('стретчинг') || name.includes('stretching'))
    return courseImages[1];
  if (name.includes('фитнес') || name.includes('fitness'))
    return courseImages[2];
  if (
    name.includes('степ') ||
    name.includes('step') ||
    name.includes('аэробик') ||
    name.includes('aerobics')
  )
    return courseImages[3];
  if (name.includes('бодифлекс') || name.includes('bodyflex'))
    return courseImages[4];
  return courseImages[0];
};

const getDifficultyLevel = (difficulty: string): number => {
  const difficultyLower = difficulty.toLowerCase();
  if (difficultyLower.includes('легк') || difficultyLower.includes('начал'))
    return 1;
  if (difficultyLower.includes('низк')) return 1;
  if (difficultyLower.includes('средн')) return 3;
  if (difficultyLower.includes('сложн') || difficultyLower.includes('продви'))
    return 5;
  if (difficultyLower.includes('эксперт') || difficultyLower.includes('профес'))
    return 5;
  if (difficultyLower.includes('высок')) return 4;
  return 3;
};

interface CourseCardProps {
  course: Course;
  onDelete: (courseId: string) => Promise<void>;
  onStartTraining: (courseId: string, courseName: string) => void;
  deleting: boolean;
}

interface LazyCourseCardsProps {
  courses: Course[];
  onDelete: (courseId: string) => Promise<void>;
  onStartTraining: (courseId: string, courseName: string) => void;
  deletingCourseId: string | null;
}

export default function MyСourses() {
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [showLessonMaterials, setShowLessonMaterials] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [removeCourse] = useRemoveCourseFromUserMutation();
  const [resetProgress] = useResetCourseProgressMutation();

  // Загрузка курсов пользователя
  useEffect(() => {
    const loadUserCourses = async () => {
      if (!isAuthenticated()) {
        console.log('Пользователь не авторизован');
        setUserCourses([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Загрузка курсов пользователя...');
        const courses = await getUserValidCourses();
        console.log('Загружены курсы:', courses);
        setUserCourses(courses);
      } catch (error) {
        console.error('Ошибка при загрузке курсов пользователя:', error);
        setUserCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserCourses();

    // Слушаем события обновления курсов
    const handleCourseChange = () => {
      console.log('Событие courseStateChanged получено');
      loadUserCourses();
    };

    window.addEventListener('courseStateChanged', handleCourseChange);

    return () => {
      window.removeEventListener('courseStateChanged', handleCourseChange);
    };
  }, []);

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        'Вы уверены, что хотите удалить этот курс? Весь прогресс будет сброшен.'
      )
    ) {
      return;
    }

    setDeletingCourseId(courseId);
    try {
      await resetProgress(courseId).unwrap();
      await removeCourse(courseId).unwrap();

      // Удаляем курс из локального состояния
      setUserCourses((prev) =>
        prev.filter((course) => course._id !== courseId)
      );

      // Уведомляем об изменении курсов
      window.dispatchEvent(new Event('courseStateChanged'));
    } catch (error: unknown) {
      console.error('Ошибка при удалении курса:', error);
      alert(getErrorMessage(error) || 'Ошибка при удалении курса');
    } finally {
      setDeletingCourseId(null);
    }
  };

  const handleStartTraining = (courseId: string, courseName: string) => {
    setSelectedCourse({ id: courseId, name: courseName });
    setShowLessonMaterials(true);
  };

  const handleCloseLessonMaterials = () => {
    setShowLessonMaterials(false);
    setSelectedCourse(null);
  };

  if (!isAuthenticated()) {
    return (
      <div className={styles.courses__box}>
        <div className={styles.noCourses}>
          <p className={styles.noCoursesText}>
            Войдите, чтобы видеть свои курсы
          </p>
          <Link href="/page/SignIn" className={styles.browseLink}>
            Войти
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.courses__box}>
        <div className={styles.noCourses}>
          <p className={styles.noCoursesText}>Загрузка курсов...</p>
        </div>
      </div>
    );
  }

  if (userCourses.length === 0) {
    return (
      <div className={styles.courses__box}>
        <div className={styles.noCourses}>
          <p className={styles.noCoursesText}>
            У вас пока нет добавленных курсов
          </p>
          <Link href="/" className={styles.browseLink}>
            Посмотреть все курсы
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.courses__box}>
      {/* Первые 2 курса загружаем сразу */}
      {userCourses.slice(0, 2).map((course: Course) => (
        <CourseCard
          key={course._id}
          course={course}
          onDelete={handleDeleteCourse}
          onStartTraining={handleStartTraining}
          deleting={deletingCourseId === course._id}
        />
      ))}

      {/* Остальные курсы лениво */}
      <Suspense fallback={<CourseSkeleton />}>
        <LazyCourseCards
          courses={userCourses.slice(2)}
          onDelete={handleDeleteCourse}
          onStartTraining={handleStartTraining}
          deletingCourseId={deletingCourseId}
        />
      </Suspense>

      {selectedCourse && (
        <LessonMaterials
          isOpen={showLessonMaterials}
          onClose={handleCloseLessonMaterials}
          userEmail=""
          loginName={selectedCourse.name}
          courseId={selectedCourse.id}
        />
      )}
    </div>
  );
}

function CourseCard({
  course,
  onDelete,
  onStartTraining,
  deleting,
}: CourseCardProps) {
  const { data: progress } = useGetUserProgressQuery(
    { courseId: course._id },
    { skip: !isAuthenticated() }
  );

  const { data: workoutsData } = useGetCourseWorkoutsQuery(course._id, {
    skip: !isAuthenticated(),
  });

  const calculateCourseTotalProgress = (): number => {
    const courseProgress = progress as CourseProgress;

    if (
      !courseProgress ||
      !courseProgress.workoutsProgress ||
      courseProgress.workoutsProgress.length === 0
    ) {
      return 0;
    }

    const workouts = workoutsData as Workout[];

    if (!workouts || workouts.length === 0) {
      const completedWorkouts = courseProgress.workoutsProgress.filter(
        (workout: WorkoutProgress) => workout.workoutCompleted
      ).length;
      const totalWorkouts = courseProgress.workoutsProgress.length;
      return Math.round((completedWorkouts / totalWorkouts) * 100);
    }

    let totalExercises = 0;
    let completedExercises = 0;

    workouts.forEach((workout: Workout) => {
      const workoutProgress = courseProgress.workoutsProgress.find(
        (wp: WorkoutProgress) => wp.workoutId === workout._id
      );

      if (workoutProgress) {
        totalExercises += workout.exercises.length;

        workoutProgress.progressData.forEach(
          (completedCount: number, index: number) => {
            const exercise = workout.exercises[index];
            if (exercise && completedCount > 0) {
              const exerciseCompletion = Math.min(
                Math.round((completedCount / exercise.quantity) * 100),
                100
              );
              completedExercises += exerciseCompletion / 100;
            }
          }
        );
      }
    });

    if (totalExercises === 0) return 0;
    return Math.round((completedExercises / totalExercises) * 100);
  };

  const completionPercentage = calculateCourseTotalProgress();
  const imageUrl = getCourseImage(course.nameRU);
  const difficultyLevel = getDifficultyLevel(course.difficulty);
  const durationText = course.durationInDays
    ? `${course.durationInDays} дней`
    : '25 дней';
  const dailyDurationText = course.dailyDurationInMinutes
    ? `${course.dailyDurationInMinutes.from}-${course.dailyDurationInMinutes.to} мин/день`
    : '20-50 мин/день';

  return (
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
        <div
          onClick={() => onDelete(course._id)}
          title="Удалить курс"
          className={styles.deleteButton}
        >
          <Image
            width={32}
            height={32}
            className={styles.courses__imageSvg}
            src="/img/Icon.svg"
            alt="Удалить курс"
          />
          {deleting && (
            <div className={styles.deletingOverlay}>Удаление...</div>
          )}
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
              />
              <p className={styles.courses__complexity}>{durationText}</p>
            </div>
            <div className={styles.courses__minDay}>
              <Image
                width={18}
                height={18}
                className={styles.courses__minDayImg}
                src="/img/Time.svg"
                alt="Time"
              />
              <p className={styles.courses__minDayDisc}>{dailyDurationText}</p>
            </div>
            <div className={styles.courses__complexity}>
              <svg viewBox="0 0 18 18" width="18" height="18" fill="none">
                <path
                  d="M15 2.625C15.2984 2.625 15.5845 2.74353 15.7955 2.9545C16.0065 3.16548 16.125 3.45163 16.125 3.75L16.125 14.25C16.125 14.5484 16.0065 14.8345 15.7955 15.0455C15.5845 15.2565 15.2984 15.375 15 15.375C14.7016 15.375 14.4155 15.2565 14.2045 15.0455C13.9935 14.8345 13.875 14.5484 13.875 14.25L13.875 3.75C13.875 3.45163 13.9935 3.16548 14.2045 2.9545C14.4155 2.74353 14.7016 2.625 15 2.625Z"
                  fill={
                    difficultyLevel >= 5 ? 'rgb(0,193,255)' : 'rgb(217,217,217)'
                  }
                />
                <path
                  d="M12 4.875C12.2984 4.875 12.5845 4.99353 12.7955 5.2045C13.0065 5.41548 13.125 5.70163 13.125 6L13.125 14.25C13.125 14.5484 13.0065 14.8345 12.7955 15.0455C12.5845 15.2565 12.2984 15.375 12 15.375C11.7016 15.375 11.4155 15.2565 11.2045 15.0455C10.9935 14.8345 10.875 14.5484 10.875 14.25L10.875 6C10.875 5.70163 10.9935 5.41548 11.2045 5.2045C11.4155 4.99353 11.7016 4.875 12 4.875Z"
                  fill={
                    difficultyLevel >= 4 ? 'rgb(0,193,255)' : 'rgb(217,217,217)'
                  }
                />
                <path
                  d="M9 7.125C9.29837 7.125 9.58452 7.24353 9.7955 7.4545C10.0065 7.66548 10.125 7.95163 10.125 8.25L10.125 14.25C10.125 14.5484 10.0065 14.8345 9.7955 15.0455C9.58452 15.2565 9.29837 15.375 9 15.375C8.70163 15.375 8.41548 15.2565 8.2045 15.0455C7.99353 14.8345 7.875 14.5484 7.875 14.25L7.875 8.25C7.875 7.95163 7.99353 7.66548 8.2045 7.4545C8.41548 7.24353 8.70163 7.125 9 7.125Z"
                  fill={
                    difficultyLevel >= 3 ? 'rgb(0,193,255)' : 'rgb(217,217,217)'
                  }
                />
                <path
                  d="M6 9.375C6.29837 9.375 6.58452 9.49353 6.7955 9.7045C7.00647 9.91548 7.125 10.2016 7.125 10.5L7.125 14.25C7.125 14.5484 7.00647 14.8345 6.7955 15.0455C6.58452 15.2565 6.29837 15.375 6 15.375C5.70163 15.375 5.41548 15.2565 5.2045 15.0455C4.99353 14.8345 4.875 14.5484 4.875 14.25L4.875 10.5C4.875 10.2016 4.99353 9.91548 5.2045 9.7045C5.41548 9.49353 5.70163 9.375 6 9.375Z"
                  fill={
                    difficultyLevel >= 2 ? 'rgb(0,193,255)' : 'rgb(217,217,217)'
                  }
                />
                <path
                  d="M3 11.625C3.29837 11.625 3.58452 11.7435 3.7955 11.9545C4.00647 12.1655 4.125 12.4516 4.125 12.75L4.125 14.25C4.125 14.5484 4.00647 14.8345 3.7955 15.0455C3.58452 15.2565 3.29837 15.375 3 15.375C2.70163 15.375 2.41548 15.2565 2.2045 15.0455C1.99353 14.8345 1.875 14.5484 1.875 14.25L1.875 12.75C1.875 12.4516 1.99353 12.1655 2.2045 11.9545C2.41548 11.7435 2.70163 11.625 3 11.625Z"
                  fill={
                    difficultyLevel >= 1 ? 'rgb(0,193,255)' : 'rgb(217,217,217)'
                  }
                />
              </svg>
              <p className={styles.courses__complexity}>
                {course.difficulty || 'Средняя'}
              </p>
            </div>
          </div>

          <div className={styles.progres__box}>
            <p className={styles.progres__percent}>
              Прогресс {completionPercentage}%
            </p>
            <div className={styles.progres__scrollbar}>
              <div
                className={styles.progres__bar}
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className={styles.progres__but}>
            <button
              onClick={() => onStartTraining(course._id, course.nameRU)}
              className={styles.progres__link}
              style={{
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                textDecoration: 'none',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                padding: 0,
              }}
            >
              {completionPercentage > 0
                ? 'Продолжить тренировку'
                : 'Начать тренировку'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function LazyCourseCards({
  courses,
  onDelete,
  onStartTraining,
  deletingCourseId,
}: LazyCourseCardsProps) {
  return (
    <>
      {courses.map((course: Course) => (
        <CourseCard
          key={course._id}
          course={course}
          onDelete={onDelete}
          onStartTraining={onStartTraining}
          deleting={deletingCourseId === course._id}
        />
      ))}
    </>
  );
}

function CourseSkeleton() {
  return (
    <article className={styles.courses__card}>
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonTitle} />
        <div className={styles.skeletonText} />
        <div className={styles.skeletonText} />
      </div>
    </article>
  );
}
