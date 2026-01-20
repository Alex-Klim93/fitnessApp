// app/components/PopUp/LessonMaterials/LessonMaterials.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LessonMaterials.module.css';
import { getCourseWorkouts, getUserProgress } from '@/app/api/simple-api';

interface LessonMaterialsProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  loginName: string;
  onLogout?: () => void;
  courseId: string;
}

interface Workout {
  _id: string;
  name: string;
}

interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

export default function LessonMaterials({
  isOpen,
  onClose,
  userEmail,
  loginName,
  onLogout,
  courseId,
}: LessonMaterialsProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutProgress, setWorkoutProgress] = useState<WorkoutProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && courseId) {
      loadWorkoutsAndProgress();
    }
  }, [isOpen, courseId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const loadWorkoutsAndProgress = async () => {
    try {
      setLoading(true);
      setSelectedWorkouts([]);

      const workoutsData = await getCourseWorkouts(courseId);
      setWorkouts(workoutsData);

      try {
        const progressResponse = await getUserProgress(courseId);
        if (progressResponse?.workoutsProgress) {
          setWorkoutProgress(progressResponse.workoutsProgress);
        }
      } catch (progressError) {
        console.log(
          'Прогресс не найден или пользователь не авторизован:',
          progressError
        );
      }
    } catch (err) {
      console.error('Ошибка загрузки тренировок:', err);
    } finally {
      setLoading(false);
    }
  };

  const isWorkoutCompleted = (workoutId: string): boolean => {
    const progress = workoutProgress.find((wp) => wp.workoutId === workoutId);
    return progress ? progress.workoutCompleted : false;
  };

  const calculateWorkoutPercentage = (workoutId: string): number => {
    const progress = workoutProgress.find((wp) => wp.workoutId === workoutId);
    if (!progress) return 0;

    const totalExercises = progress.progressData.length;
    if (totalExercises === 0) return 0;

    const completedExercises = progress.progressData.filter(
      (val) => val > 0
    ).length;
    return Math.round((completedExercises / totalExercises) * 100);
  };

  const handleWorkoutSelect = (workoutId: string) => {
    setSelectedWorkouts((prev) => {
      if (prev.includes(workoutId)) {
        return prev.filter((id) => id !== workoutId);
      } else {
        return [...prev, workoutId];
      }
    });
  };

  const handleStartWorkout = () => {
    if (selectedWorkouts.length > 0) {
      // Берем первую тренировку как основную для URL
      const firstWorkoutId = selectedWorkouts[0];
      // Кодируем все workoutIds для передачи в параметрах
      const workoutIdsParam = encodeURIComponent(selectedWorkouts.join(','));

      // Переходим на страницу первой тренировки, но передаем все выбранные
      router.push(
        `/page/Video/${firstWorkoutId}?courseId=${courseId}&workoutIds=${workoutIdsParam}`
      );
      onClose();
    }
  };

  const isWorkoutSelected = (workoutId: string): boolean => {
    return selectedWorkouts.includes(workoutId);
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <p className={styles.title}>Выберите тренировки</p>

        <div className={styles.workout__box}>
          <div className={styles.workout__list}>
            {loading ? (
              <div className={styles.loading}>Загрузка тренировок...</div>
            ) : workouts.length === 0 ? (
              <div className={styles.empty}>Тренировки не найдены</div>
            ) : (
              workouts.map((workout) => {
                const completed = isWorkoutCompleted(workout._id);
                const percentage = calculateWorkoutPercentage(workout._id);
                const selected = isWorkoutSelected(workout._id);

                return (
                  <div
                    key={workout._id}
                    className={styles.checkbox__box}
                    onClick={() => handleWorkoutSelect(workout._id)}
                  >
                    <div className={styles.checkbox__container}>
                      <input
                        type="checkbox"
                        id={`workout-${workout._id}`}
                        className={styles.checkbox__input}
                        checked={selected}
                        readOnly
                      />
                      <div className={styles.checkbox__custom}>
                        {selected && (
                          <div className={styles.checkmark}>
                            <svg
                              viewBox="0 0 24 24"
                              style={{
                                width: '16px',
                                height: '16px',
                                display: 'block',
                                margin: '4px auto',
                              }}
                            >
                              <path
                                fill="white"
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.checkbox__text}>
                      <span className={styles.workout__link}>
                        {workout.name}
                        {percentage > 0 && (
                          <span
                            className={`${styles.workout__progress} ${percentage === 100 ? styles.completed : ''}`}
                          >
                            ({percentage}%)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={styles.button__container}>
          <button
            className={styles.menuItem__profil}
            onClick={handleStartWorkout}
            disabled={selectedWorkouts.length === 0}
          >
            {selectedWorkouts.length === 1
              ? 'Начать тренировку'
              : `Начать ${selectedWorkouts.length} тренировок`}
          </button>
        </div>
      </div>
    </div>
  );
}
