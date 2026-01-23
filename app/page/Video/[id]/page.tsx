'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { isAuthenticated } from '@/app/api/auth';
import {
  useGetCourseByIdQuery,
  useGetCourseWorkoutsQuery,
} from '@/app/api/coursesApi';
import { useGetUserProgressQuery } from '@/app/api/progressApi';
import { useGetWorkoutByIdQuery } from '@/app/api/workoutsApi';

// Ленивая загрузка тяжелых компонентов
const VideoPlayer = dynamic(
  () => import('@/app/components/VideoPlayer/VideoPlayer'),
  {
    loading: () => (
      <div className={styles.videoLoading}>Загрузка плеера...</div>
    ),
    ssr: false,
  }
);

const ProgressPopup = dynamic(
  () => import('@/app/components/PopUp/ProgressPopup/ProgressPopup'),
  {
    loading: () => <div>Загрузка формы...</div>,
  }
);

const Performance = dynamic(
  () => import('@/app/components/PopUp/Performance/Performance'),
  {
    loading: () => <div>Загрузка...</div>,
  }
);

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

interface Course {
  _id: string;
  nameEN: string;
  nameRU: string;
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

export default function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [workoutsProgress, setWorkoutsProgress] = useState<
    Record<string, WorkoutProgress>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workoutId, setWorkoutId] = useState<string>('');
  const [isProgressPopupOpen, setIsProgressPopupOpen] = useState(false);
  const [isPerformanceOpen, setIsPerformanceOpen] = useState(false);
  const [selectedWorkoutForPopup, setSelectedWorkoutForPopup] =
    useState<string>('');
  const [currentProgressData, setCurrentProgressData] = useState<number[]>([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams?.get('courseId') || '';
  const workoutIdsParam = searchParams?.get('workoutIds') || '';
  const [selectedWorkoutIds, setSelectedWorkoutIds] = useState<string[]>([]);

  // Получаем параметры асинхронно
  useEffect(() => {
    const getParamsData = async () => {
      const { id } = await params;
      setWorkoutId(id);

      if (workoutIdsParam) {
        const ids = decodeURIComponent(workoutIdsParam).split(',');
        setSelectedWorkoutIds(ids);
      }
    };

    getParamsData();
  }, [params, workoutIdsParam]);

  // RTK Query запросы
  const { data: currentWorkout, isLoading: workoutLoading } =
    useGetWorkoutByIdQuery(workoutId, {
      skip: !workoutId,
    });

  const { data: courseData, isLoading: courseLoading } = useGetCourseByIdQuery(
    courseId,
    {
      skip: !courseId,
    }
  );

  const { data: progressData } = useGetUserProgressQuery(
    { courseId },
    { skip: !courseId || !isAuthenticated() }
  );

  const { data: allWorkoutsData } = useGetCourseWorkoutsQuery(courseId, {
    skip: !courseId,
  });

  // Загружаем все выбранные тренировки
  useEffect(() => {
    const loadSelectedWorkouts = async () => {
      if (!allWorkoutsData || selectedWorkoutIds.length === 0) return;

      try {
        const selectedWorkouts = allWorkoutsData.filter((workout: Workout) =>
          selectedWorkoutIds.includes(workout._id)
        );
        setWorkouts(selectedWorkouts);
      } catch (error) {
        console.error('Ошибка фильтрации тренировок:', error);
      }
    };

    loadSelectedWorkouts();
  }, [allWorkoutsData, selectedWorkoutIds]);

  // Обновление состояния при получении данных
  useEffect(() => {
    if (courseData) {
      setCourse(courseData);
    }

    if (progressData?.workoutsProgress) {
      const progressMap: Record<string, WorkoutProgress> = {};
      progressData.workoutsProgress.forEach((wp: WorkoutProgress) => {
        progressMap[wp.workoutId] = wp;
      });
      setWorkoutsProgress(progressMap);
    }

    // Если выбраны тренировки из попапа, используем их
    if (selectedWorkoutIds.length > 0 && allWorkoutsData) {
      // Проверяем загрузку всех данных
      if (courseData && !courseLoading && !workoutLoading) {
        setLoading(false);
      }
    } else {
      // Если тренировка только одна (старый путь)
      if (currentWorkout && courseData) {
        setWorkouts([currentWorkout]);
        if (!courseLoading && !workoutLoading) {
          setLoading(false);
        }
      }
    }

    // Проверка на ошибки
    if (!courseLoading && !workoutLoading && courseId && workoutId) {
      if (!courseData && !currentWorkout) {
        setError('Не удалось загрузить данные тренировки');
        setLoading(false);
      }
    }
  }, [
    currentWorkout,
    courseData,
    progressData,
    allWorkoutsData,
    courseLoading,
    workoutLoading,
    courseId,
    workoutId,
    selectedWorkoutIds,
  ]);

  // Если нет courseId, показываем ошибку
  useEffect(() => {
    if (workoutId && !courseId && !loading) {
      setError(
        'ID курса не указан. Пожалуйста, перейдите из раздела "Мои курсы"'
      );
      setLoading(false);
    }
  }, [workoutId, courseId, loading]);

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

  const handleOpenPerformance = () => {
    setIsPerformanceOpen(true);
  };

  const handleClosePerformance = () => {
    setIsPerformanceOpen(false);
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
              <VideoPlayer videoUrl={workout.video} />
            <div className={styles.video__exercises}>
              <h4 className={styles.exercises__title}>
                Упражнения тренировки {index + 1}
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
                    Обновить свой прогресс
                  </div>
                ) : (
                  <Link href="/page/SignIn" className={styles.exercises__link}>
                    Обновить свой прогресс
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* ProgressPopup */}
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
          onProgressSaved={(newProgress) => {
            handleProgressSaved(selectedWorkoutForPopup, newProgress);
            // После сохранения прогресса показываем Performance
            handleOpenPerformance();
          }}
        />
      )}

      {/* Performance */}
      <Performance
        isOpen={isPerformanceOpen}
        onClose={handleClosePerformance}
        userEmail=""
        loginName=""
      />
    </div>
  );
}
