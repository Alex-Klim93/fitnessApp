// app/utils/courseCheck.ts
import { getCurrentUser, UserData } from "@/app/api/simple-api";
import { isAuthenticated } from "@/app/api/auth";

// Кэш для данных пользователя
let userCache: UserData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60000; // 1 минута

export const checkIfCourseAdded = async (
  courseId: string,
): Promise<boolean> => {
  if (!isAuthenticated()) {
    return false;
  }

  try {
    // Проверяем кэш
    const now = Date.now();
    if (userCache && now - cacheTimestamp < CACHE_DURATION) {
      return userCache?.selectedCourses?.includes(courseId) || false;
    }

    // Загружаем данные пользователя
    const userResponse = await getCurrentUser();

    // Обновляем кэш
    userCache = userResponse;
    cacheTimestamp = now;

    return userResponse?.selectedCourses?.includes(courseId) || false;
  } catch (error) {
    console.error("Ошибка при проверке курса:", error);
    return false;
  }
};

export const clearUserCache = () => {
  userCache = null;
  cacheTimestamp = 0;
};
