// app/page/video/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import VideoPlayer from '@/app/components/VideoPlayer/VideoPlayer';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  getCourseById,
  getWorkoutById,
  getUserProgress,
  getCourseWorkouts,
} from '@/app/api/simple-api';
import { isAuthenticated } from '@/app/api/auth';
import ProgressPopup from '@/app/components/PopUp/ProgressPopup/ProgressPopup';

interface Exercise {
  _id: string;
  name: string;
  quantity: number;
}

interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Exercise[];
}

interface CourseWorkout {
  _id: string;
  name: string;
}

interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

interface Course {
  _id: string;
  nameEN: string;
  nameRU: string;
}

export default function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [courseWorkouts, setCourseWorkouts] = useState<CourseWorkout[]>([]);
  const [workoutsProgress, setWorkoutsProgress] = useState<
    Record<string, WorkoutProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutId, setWorkoutId] = useState<string>('');
  const [isProgressPopupOpen, setIsProgressPopupOpen] = useState(false);
  const [selectedWorkoutForPopup, setSelectedWorkoutForPopup] =
    useState<string>('');
  const [currentProgressData, setCurrentProgressData] = useState<number[]>([]);
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams?.get('courseId') || '';
  const workoutIdsParam = searchParams?.get('workoutIds') || '';

  useEffect(() => {
    const getWorkoutId = async () => {
      const { id } = await params;
      setWorkoutId(id);

      // Парсим workoutIds из параметров
      if (workoutIdsParam) {
        const ids = decodeURIComponent(workoutIdsParam).split(',');
        setSelectedWorkoutIds(ids);
      }
    };
    getWorkoutId();
  }, [params, workoutIdsParam]);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!workoutId) return;

        if (!courseId) {
          throw new Error(
            'ID курса не указан. Пожалуйста, перейдите из раздела "Мои курсы"'
          );
        }

        // Загружаем курс
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        // Определяем какие тренировки загружать
        let workoutIdsToLoad: string[] = [];

        if (selectedWorkoutIds.length > 0) {
          // Загружаем все выбранные тренировки
          workoutIdsToLoad = selectedWorkoutIds;
        } else {
          // Если не выбраны, загружаем только текущую тренировку
          workoutIdsToLoad = [workoutId];
        }

        // Загружаем все тренировки параллельно
        const workoutPromises = workoutIdsToLoad.map((id) =>
          getWorkoutById(id)
        );
        const workoutsData = await Promise.all(workoutPromises);
        setWorkouts(workoutsData);

        // Загружаем список всех тренировок курса
        try {
          const allWorkouts = await getCourseWorkouts(courseId);
          setCourseWorkouts(allWorkouts);
        } catch (err) {
          console.error('Ошибка загрузки тренировок курса:', err);
        }

        // Загружаем прогресс для авторизованных пользователей
        if (isAuthenticated() && courseId) {
          try {
            const progressResponse = await getUserProgress(courseId);

            if (progressResponse?.workoutsProgress) {
              const progressMap: Record<string, WorkoutProgress> = {};
              progressResponse.workoutsProgress.forEach(
                (wp: WorkoutProgress) => {
                  progressMap[wp.workoutId] = wp;
                }
              );
              setWorkoutsProgress(progressMap);
            }
          } catch (progressError) {
            console.log('Прогресс не найден или ошибка:', progressError);
          }
        }
      } catch (err: any) {
        console.error('Ошибка загрузки данных:', err);
        setError(err.message || 'Ошибка при загрузке данных тренировки');
      } finally {
        setLoading(false);
      }
    };

    if (workoutId && courseId) {
      loadAllData();
    } else if (workoutId && !courseId) {
      setLoading(false);
      setError(
        'ID курса не указан. Пожалуйста, перейдите из раздела "Мои курсы"'
      );
    }
  }, [workoutId, courseId, selectedWorkoutIds]);

  const handleOpenProgressPopup = (workoutId: string) => {
    setSelectedWorkoutForPopup(workoutId);
    const workout = workouts.find((w) => w._id === workoutId);
    if (workout) {
      const progress = workoutsProgress[workoutId];
      setCurrentProgressData(
        progress?.progressData || new Array(workout.exercises.length).fill(0)
      );
    }
    setIsProgressPopupOpen(true);
  };

  const handleCloseProgressPopup = () => {
    setIsProgressPopupOpen(false);
    setSelectedWorkoutForPopup('');
  };

  const handleProgressSaved = (workoutId: string, newProgress: number[]) => {
    setWorkoutsProgress((prev) => ({
      ...prev,
      [workoutId]: {
        workoutId,
        workoutCompleted: newProgress.every((val) => val > 0),
        progressData: newProgress,
      },
    }));
  };

  const calculateExercisePercentage = (
    workoutId: string,
    exerciseIndex: number
  ): number => {
    const progress = workoutsProgress[workoutId];
    const workout = workouts.find((w) => w._id === workoutId);

    if (!workout || !workout.exercises[exerciseIndex]) return 0;

    const exercise = workout.exercises[exerciseIndex];
    const completed = progress?.progressData[exerciseIndex] || 0;
    const total = exercise.quantity;

    if (total === 0) return 0;
    return Math.min(Math.round((completed / total) * 100), 100);
  };

  const calculateTotalProgressForWorkout = (workoutId: string): number => {
    const workout = workouts.find((w) => w._id === workoutId);
    if (!workout || workout.exercises.length === 0) return 0;

    const totalPercentages = workout.exercises.reduce(
      (sum, exercise, index) => {
        return sum + calculateExercisePercentage(workoutId, index);
      },
      0
    );

    return Math.round(totalPercentages / workout.exercises.length);
  };

  if (loading) {
    return (
      <div>
        <div className={styles.video}>
          <h1 className={styles.video__title}>Загрузка тренировок...</h1>
          <div className={styles.video__player}>
            <VideoPlayer />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className={styles.video}>
          <h1 className={styles.video__title}>Ошибка</h1>
          <p style={{ textAlign: 'center', color: 'red', padding: '20px' }}>
            {error}
          </p>
          <div className={styles.exercises__but}>
            <Link href="/" className={styles.exercises__link}>
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!workouts.length || !course) {
    return (
      <div>
        <div className={styles.video}>
          <h1 className={styles.video__title}>Тренировки не найдены</h1>
          <p style={{ textAlign: 'center', padding: '20px' }}>
            Тренировки не существуют или были удалены
          </p>
          <div className={styles.exercises__but}>
            <Link href="/" className={styles.exercises__link}>
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.title}>
        <h1 className={styles.video__title}>{course.nameRU}</h1>
      </div>
      {workouts.map((workout, index) => {
        const totalProgress = calculateTotalProgressForWorkout(workout._id);

        return (
          <div key={workout._id} className={styles.video}>
            <div className={styles.video__player}>
              <VideoPlayer videoUrl={workout.video} />
            </div>
            <div className={styles.video__exercises}>
              <h4 className={styles.exercises__title}>
                Упражнения тренировки ({workout.exercises.length})
              </h4>
              <div className={styles.exercises__box}>
                {workout.exercises.map((exercise, exIndex) => {
                  const percentage = calculateExercisePercentage(
                    workout._id,
                    exIndex
                  );

                  return (
                    <div
                      key={exercise._id || exIndex}
                      className={styles.exercises__min}
                    >
                      <p className={styles.exercises__text}>
                        {exercise.name} {percentage}%
                      </p>
                      <div className={styles.progressControls}>
                        <div className={styles.exercises__sidebar}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className={styles.exercises__but}
                onClick={() => handleOpenProgressPopup(workout._id)}
                style={{ cursor: 'pointer' }}
              >
                {isAuthenticated() ? (
                  <div className={styles.exercises__link}>
                    Заполнить свой прогресс для этой тренировки
                  </div>
                ) : (
                  <Link href="/page/SignIn" className={styles.exercises__link}>
                    Войдите, чтобы сохранить прогресс
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {selectedWorkoutForPopup && (
        <ProgressPopup
          isOpen={isProgressPopupOpen}
          onClose={handleCloseProgressPopup}
          userEmail=""
          loginName=""
          courseId={courseId}
          workoutId={selectedWorkoutForPopup}
          exercises={
            workouts.find((w) => w._id === selectedWorkoutForPopup)
              ?.exercises || []
          }
          currentProgress={currentProgressData}
          onProgressSaved={(newProgress) =>
            handleProgressSaved(selectedWorkoutForPopup, newProgress)
          }
        />
      )}
    </div>
  );
}
