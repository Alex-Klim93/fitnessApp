// app/components/MyCourses/MyСourses.tsx
'use client';

import Image from 'next/image';
import styles from './MyСourses.module.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getCourseById,
  resetCourseProgress,
  getUserProgress,
  removeCourseFromUser,
  getCurrentUser,
  getAllCourses,
  getWorkoutById,
} from '@/app/api/simple-api';
import { isAuthenticated } from '@/app/api/auth';
import { getErrorMessage } from '@/app/api/errors';
import LessonMaterials from '../PopUp/LessonMaterials/LessonMaterials';

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

const courseImages = [
  '/img/image9.png',
  '/img/image 5.png',
  '/img/Untitled-1 1.png',
  '/img/image 7.png',
  '/img/image 8.png',
];

const getCourseImage = (courseName: string): string => {
  const name = courseName.toLowerCase();

  if (name.includes('йога') || name.includes('yoga')) {
    return courseImages[0];
  } else if (name.includes('стретчинг') || name.includes('stretching')) {
    return courseImages[1];
  } else if (name.includes('фитнес') || name.includes('fitness')) {
    return courseImages[2];
  } else if (
    name.includes('степ') ||
    name.includes('step') ||
    name.includes('аэробик') ||
    name.includes('aerobics')
  ) {
    return courseImages[3];
  } else if (name.includes('бодифлекс') || name.includes('bodyflex')) {
    return courseImages[4];
  }

  return courseImages[0];
};

export default function MyСourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesProgress, setCoursesProgress] = useState<
    Record<string, CourseProgress>
  >({});
  const [workoutsData, setWorkoutsData] = useState<Record<string, Workout[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [showLessonMaterials, setShowLessonMaterials] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchUserData = async (): Promise<string[]> => {
    try {
      if (!isAuthenticated()) {
        return [];
      }

      const userResponse = (await getCurrentUser()) as UserResponse;
      return userResponse.user?.selectedCourses || [];
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
      if (error instanceof Error && error.message.includes('401')) {
        localStorage.removeItem('auth_token');
        window.dispatchEvent(new Event('authStateChanged'));
      }
      throw error;
    }
  };

  // НОВАЯ ФУНКЦИЯ: Расчет общего прогресса курса на основе всех упражнений
  const calculateCourseTotalProgress = (
    courseId: string,
    progress: CourseProgress | null
  ): number => {
    if (
      !progress ||
      !progress.workoutsProgress ||
      progress.workoutsProgress.length === 0
    ) {
      return 0;
    }

    const workouts = workoutsData[courseId];
    if (!workouts || workouts.length === 0) {
      // Если нет данных о тренировках, считаем по количеству завершенных тренировок
      const completedWorkouts = progress.workoutsProgress.filter(
        (workout) => workout.workoutCompleted
      ).length;
      const totalWorkouts = progress.workoutsProgress.length;
      return Math.round((completedWorkouts / totalWorkouts) * 100);
    }

    let totalExercises = 0;
    let completedExercises = 0;

    // Проходим по всем тренировкам курса
    workouts.forEach((workout) => {
      const workoutProgress = progress.workoutsProgress.find(
        (wp) => wp.workoutId === workout._id
      );

      if (workoutProgress) {
        // Считаем общее количество упражнений в тренировке
        totalExercises += workout.exercises.length;

        // Считаем выполненные упражнения
        workoutProgress.progressData.forEach((completedCount, index) => {
          const exercise = workout.exercises[index];
          if (exercise && completedCount > 0) {
            // Считаем процент выполнения для каждого упражнения
            const exerciseCompletion = Math.min(
              Math.round((completedCount / exercise.quantity) * 100),
              100
            );
            completedExercises += exerciseCompletion / 100; // Добавляем долю выполненного упражнения
          }
        });
      }
    });

    if (totalExercises === 0) return 0;

    // Вычисляем общий процент выполнения
    const totalPercentage = Math.round(
      (completedExercises / totalExercises) * 100
    );
    return Math.min(totalPercentage, 100);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (
      !confirm(
        'Вы уверены, что хотите удалить этот курс? Весь прогресс будет сброшен.'
      )
    ) {
      return;
    }

    try {
      setDeletingCourseId(courseId);

      if (!isAuthenticated()) {
        throw new Error('Требуется авторизация');
      }

      try {
        await resetCourseProgress(courseId);
      } catch (resetError) {
        console.warn(
          `Не удалось сбросить прогресс для курса ${courseId}:`,
          resetError
        );
      }

      await removeCourseFromUser(courseId);

      setCourses((prevCourses) =>
        prevCourses.filter((course) => course._id !== courseId)
      );

      setUserCourses((prev) => prev.filter((id) => id !== courseId));

      setCoursesProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[courseId];
        return newProgress;
      });

      setWorkoutsData((prev) => {
        const newData = { ...prev };
        delete newData[courseId];
        return newData;
      });

      window.dispatchEvent(new Event('userDataUpdated'));

      alert('Курс успешно удален!');
    } catch (error: any) {
      console.error('Ошибка при удалении курса:', error);
      alert(getErrorMessage(error) || 'Ошибка при удалении курса');
    } finally {
      setDeletingCourseId(null);
    }
  };

  const getDifficultyLevel = (difficulty: string): number => {
    const difficultyLower = difficulty.toLowerCase();

    if (difficultyLower.includes('легк') || difficultyLower.includes('начал')) {
      return 1;
    } else if (difficultyLower.includes('низк')) {
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

    return 3;
  };

  const fetchFilteredCourses = async (
    selectedCourseIds: string[]
  ): Promise<Course[]> => {
    try {
      const allCourses = await getAllCourses();
      const filteredCourses = allCourses.filter((course: Course) =>
        selectedCourseIds.includes(course._id)
      );

      return filteredCourses;
    } catch (err) {
      const coursePromises = selectedCourseIds.map((courseId) =>
        getCourseById(courseId).catch(() => ({
          _id: courseId,
          nameRU: `Курс ${courseId.slice(0, 8)}...`,
          nameEN: `Course ${courseId.slice(0, 8)}...`,
          description: 'Описание курса недоступно',
          directions: ['Направление'],
          fitting: ['Подходит для всех'],
          difficulty: 'средняя',
          durationInDays: 30,
          dailyDurationInMinutes: { from: 20, to: 40 },
          workouts: [],
        }))
      );

      const coursesData = await Promise.all(coursePromises);
      return coursesData;
    }
  };

  const fetchCourseProgress = async (
    courseId: string
  ): Promise<CourseProgress | null> => {
    try {
      const progress = await getUserProgress(courseId);
      return progress;
    } catch (error) {
      return null;
    }
  };

  // НОВАЯ ФУНКЦИЯ: Загрузка данных о тренировках для каждого курса
  const fetchWorkoutsForCourse = async (
    courseId: string
  ): Promise<Workout[]> => {
    try {
      const response = await fetch(
        `https://wedev-api.sky.pro/api/fitness/courses/${courseId}/workouts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const workoutsList = await response.json();

      // Загружаем детали каждой тренировки
      const detailedWorkouts = await Promise.all(
        workoutsList.map(async (workout: any) => {
          try {
            const workoutDetails = await getWorkoutById(workout._id);
            return {
              _id: workout._id,
              name: workout.name,
              exercises: workoutDetails.exercises || [],
            };
          } catch (error) {
            console.error(`Error loading workout ${workout._id}:`, error);
            return {
              _id: workout._id,
              name: workout.name,
              exercises: [],
            };
          }
        })
      );

      return detailedWorkouts;
    } catch (error) {
      console.error(`Ошибка загрузки тренировок для курса ${courseId}:`, error);
      return [];
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

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userSelectedCourses = await fetchUserData();

        setUserCourses(userSelectedCourses);

        if (!Array.isArray(userSelectedCourses)) {
          setCourses([]);
          setLoading(false);
          return;
        }

        if (userSelectedCourses.length === 0) {
          setCourses([]);
          setCoursesProgress({});
          setWorkoutsData({});
          setLoading(false);
          return;
        }

        const coursesData = await fetchFilteredCourses(userSelectedCourses);
        setCourses(coursesData);

        if (isAuthenticated()) {
          // Загружаем прогресс для каждого курса
          const progressPromises = coursesData.map(async (course) => {
            const progress = await fetchCourseProgress(course._id);
            return { courseId: course._id, progress };
          });

          const progressResults = await Promise.all(progressPromises);
          const progressMap: Record<string, CourseProgress> = {};

          progressResults.forEach((result) => {
            if (result.progress) {
              progressMap[result.courseId] = result.progress;
            }
          });

          setCoursesProgress(progressMap);

          // Загружаем данные о тренировках для каждого курса
          const workoutsPromises = coursesData.map(async (course) => {
            const workouts = await fetchWorkoutsForCourse(course._id);
            return { courseId: course._id, workouts };
          });

          const workoutsResults = await Promise.all(workoutsPromises);
          const workoutsMap: Record<string, Workout[]> = {};

          workoutsResults.forEach((result) => {
            workoutsMap[result.courseId] = result.workouts;
          });

          setWorkoutsData(workoutsMap);
        }
      } catch (error) {
        setError(
          getErrorMessage(error) || 'Не удалось загрузить данные курсов'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const handleUserDataUpdated = async () => {
      try {
        setLoading(true);

        const userSelectedCourses = await fetchUserData();
        setUserCourses(userSelectedCourses);

        if (
          !Array.isArray(userSelectedCourses) ||
          userSelectedCourses.length === 0
        ) {
          setCourses([]);
          setWorkoutsData({});
          setLoading(false);
          return;
        }

        const coursesData = await fetchFilteredCourses(userSelectedCourses);
        setCourses(coursesData);

        if (isAuthenticated()) {
          const progressPromises = coursesData.map(async (course) => {
            const progress = await fetchCourseProgress(course._id);
            return { courseId: course._id, progress };
          });

          const progressResults = await Promise.all(progressPromises);
          const progressMap: Record<string, CourseProgress> = {};

          progressResults.forEach((result) => {
            if (result.progress) {
              progressMap[result.courseId] = result.progress;
            }
          });

          setCoursesProgress(progressMap);

          // Обновляем данные о тренировках
          const workoutsPromises = coursesData.map(async (course) => {
            const workouts = await fetchWorkoutsForCourse(course._id);
            return { courseId: course._id, workouts };
          });

          const workoutsResults = await Promise.all(workoutsPromises);
          const workoutsMap: Record<string, Workout[]> = {};

          workoutsResults.forEach((result) => {
            workoutsMap[result.courseId] = result.workouts;
          });

          setWorkoutsData(workoutsMap);
        }
      } catch (error) {
        console.error('Ошибка перезагрузки данных:', error);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdated);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdated);
    };
  }, []);

  useEffect(() => {
    const handleAuthStateChanged = () => {
      const fetchAllData = async () => {
        try {
          setLoading(true);

          if (isAuthenticated()) {
            const userSelectedCourses = await fetchUserData();
            setUserCourses(userSelectedCourses);

            if (
              Array.isArray(userSelectedCourses) &&
              userSelectedCourses.length > 0
            ) {
              const coursesData =
                await fetchFilteredCourses(userSelectedCourses);
              setCourses(coursesData);

              const progressPromises = coursesData.map(async (course) => {
                const progress = await fetchCourseProgress(course._id);
                return { courseId: course._id, progress };
              });

              const progressResults = await Promise.all(progressPromises);
              const progressMap: Record<string, CourseProgress> = {};

              progressResults.forEach((result) => {
                if (result.progress) {
                  progressMap[result.courseId] = result.progress;
                }
              });

              setCoursesProgress(progressMap);

              // Загружаем данные о тренировках
              const workoutsPromises = coursesData.map(async (course) => {
                const workouts = await fetchWorkoutsForCourse(course._id);
                return { courseId: course._id, workouts };
              });

              const workoutsResults = await Promise.all(workoutsPromises);
              const workoutsMap: Record<string, Workout[]> = {};

              workoutsResults.forEach((result) => {
                workoutsMap[result.courseId] = result.workouts;
              });

              setWorkoutsData(workoutsMap);
            } else {
              setCourses([]);
              setCoursesProgress({});
              setWorkoutsData({});
            }
          } else {
            setCourses([]);
            setUserCourses([]);
            setCoursesProgress({});
            setWorkoutsData({});
          }
        } catch (error) {
          console.error(
            'Ошибка перезагрузки данных при изменении авторизации:',
            error
          );
        } finally {
          setLoading(false);
        }
      };

      fetchAllData();
    };

    window.addEventListener('authStateChanged', handleAuthStateChanged);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChanged);
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.courses__box}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка ваших курсов...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.courses__box}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Обновить</button>
        </div>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
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
      {courses.map((course) => {
        const imageUrl = getCourseImage(course.nameRU);
        const durationText = course.durationInDays
          ? `${course.durationInDays} дней`
          : '25 дней';
        const dailyDurationText = course.dailyDurationInMinutes
          ? `${course.dailyDurationInMinutes.from}-${course.dailyDurationInMinutes.to} мин/день`
          : '20-50 мин/день';
        const difficultyText = course.difficulty || 'Средняя';
        const difficultyLevel = getDifficultyLevel(difficultyText);
        const progress = coursesProgress[course._id];

        // ИСПРАВЛЕННЫЙ РАСЧЕТ: используем новую функцию для расчета общего прогресса
        const completionPercentage = calculateCourseTotalProgress(
          course._id,
          progress
        );

        return (
          <article key={course._id} className={styles.courses__card}>
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
                onClick={() => handleDeleteCourse(course._id)}
                title="Удалить курс"
                className={styles.deleteButton}
              >
                <Image
                  width={32}
                  height={32}
                  className={styles.courses__imageSvg}
                  src="/img/Icon.svg"
                  alt="Удалить курс"
                  priority
                />
                {deletingCourseId === course._id && (
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
                    <svg
                      viewBox="0 0 18 18"
                      width="18"
                      height="18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15 2.625C15.2984 2.625 15.5845 2.74353 15.7955 2.9545C16.0065 3.16548 16.125 3.45163 16.125 3.75L16.125 14.25C16.125 14.5484 16.0065 14.8345 15.7955 15.0455C15.5845 15.2565 15.2984 15.375 15 15.375C14.7016 15.375 14.4155 15.2565 14.2045 15.0455C13.9935 14.8345 13.875 14.5484 13.875 14.25L13.875 3.75C13.875 3.45163 13.9935 3.16548 14.2045 2.9545C14.4155 2.74353 14.7016 2.625 15 2.625Z"
                        fill={
                          difficultyLevel >= 5
                            ? 'rgb(0,193,255)'
                            : 'rgb(217,217,217)'
                        }
                        fillRule="evenodd"
                      />
                      <path
                        d="M12 4.875C12.2984 4.875 12.5845 4.99353 12.7955 5.2045C13.0065 5.41548 13.125 5.70163 13.125 6L13.125 14.25C13.125 14.5484 13.0065 14.8345 12.7955 15.0455C12.5845 15.2565 12.2984 15.375 12 15.375C11.7016 15.375 11.4155 15.2565 11.2045 15.0455C10.9935 14.8345 10.875 14.5484 10.875 14.25L10.875 6C10.875 5.70163 10.9935 5.41548 11.2045 5.2045C11.4155 4.99353 11.7016 4.875 12 4.875Z"
                        fill={
                          difficultyLevel >= 4
                            ? 'rgb(0,193,255)'
                            : 'rgb(217,217,217)'
                        }
                        fillRule="evenodd"
                      />
                      <path
                        d="M9 7.125C9.29837 7.125 9.58452 7.24353 9.7955 7.4545C10.0065 7.66548 10.125 7.95163 10.125 8.25L10.125 14.25C10.125 14.5484 10.0065 14.8345 9.7955 15.0455C9.58452 15.2565 9.29837 15.375 9 15.375C8.70163 15.375 8.41548 15.2565 8.2045 15.0455C7.99353 14.8345 7.875 14.5484 7.875 14.25L7.875 8.25C7.875 7.95163 7.99353 7.66548 8.2045 7.4545C8.41548 7.24353 8.70163 7.125 9 7.125Z"
                        fill={
                          difficultyLevel >= 3
                            ? 'rgb(0,193,255)'
                            : 'rgb(217,217,217)'
                        }
                        fillRule="evenodd"
                      />
                      <path
                        d="M6 9.375C6.29837 9.375 6.58452 9.49353 6.7955 9.7045C7.00647 9.91548 7.125 10.2016 7.125 10.5L7.125 14.25C7.125 14.5484 7.00647 14.8345 6.7955 15.0455C6.58452 15.2565 6.29837 15.375 6 15.375C5.70163 15.375 5.41548 15.2565 5.2045 15.0455C4.99353 14.8345 4.875 14.5484 4.875 14.25L4.875 10.5C4.875 10.2016 4.99353 9.91548 5.2045 9.7045C5.41548 9.49353 5.70163 9.375 6 9.375Z"
                        fill={
                          difficultyLevel >= 2
                            ? 'rgb(0,193,255)'
                            : 'rgb(217,217,217)'
                        }
                        fillRule="evenodd"
                      />
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
                    onClick={() =>
                      handleStartTraining(course._id, course.nameRU)
                    }
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
      })}

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
