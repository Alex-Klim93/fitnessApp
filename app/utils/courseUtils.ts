// app/utils/courseUtils.ts
import {
  getAllCourses,
  Course,
  getCurrentUser,
  UserData,
} from '@/app/api/simple-api';

// Кэш для всех курсов (только на клиенте)
let allCoursesCache: Course[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

/**
 * Получает все курсы с кэшированием (только на клиенте)
 */
export const getAllCoursesCached = async (): Promise<Course[]> => {
  // Проверяем, что мы на клиенте
  if (typeof window === 'undefined') {
    return [];
  }

  const now = Date.now();

  if (allCoursesCache && now - cacheTimestamp < CACHE_DURATION) {
    return allCoursesCache;
  }

  try {
    const courses = await getAllCourses();
    allCoursesCache = courses;
    cacheTimestamp = now;
    return courses;
  } catch (error) {
    console.error('Ошибка при получении курсов:', error);
    // Возвращаем кэш, даже если он устарел
    return allCoursesCache || [];
  }
};

/**
 * Получает данные текущего пользователя
 */
export const getCurrentUserData = async (): Promise<UserData | null> => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return null;
  }
};

/**
 * Получает действительные курсы пользователя (которые существуют в системе)
 */
export const getValidUserCourses = async (
  userData: UserData | null
): Promise<Course[]> => {
  if (
    !userData ||
    !userData.selectedCourses ||
    userData.selectedCourses.length === 0
  ) {
    return [];
  }

  try {
    const allCourses = await getAllCoursesCached();

    // Если не удалось получить курсы, возвращаем пустой массив
    if (allCourses.length === 0) {
      return [];
    }

    // Фильтруем только те курсы, которые существуют в системе
    const userCourses = allCourses.filter((course) =>
      userData.selectedCourses.includes(course._id)
    );

    return userCourses;
  } catch (error) {
    console.error('Ошибка при получении курсов пользователя:', error);
    return [];
  }
};

/**
 * Проверяет, добавлен ли конкретный курс у пользователя
 */
export const isCourseAddedByUser = async (
  courseId: string,
  userData: UserData | null
): Promise<boolean> => {
  if (!userData || !userData.selectedCourses) {
    return false;
  }

  return userData.selectedCourses.includes(courseId);
};
