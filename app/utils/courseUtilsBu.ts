// app/utils/courseUtilsBu.ts
import { userApi } from '@/app/api/userApi';
import { store } from '@/app/store/store';

export const isCourseInUserSelection = async (
  courseId: string
): Promise<boolean> => {
  try {
    // Проверяем авторизацию
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    // Получаем данные пользователя из кэша RTK Query или делаем запрос
    const result = await store.dispatch(
      userApi.endpoints.getCurrentUser.initiate(undefined, {
        forceRefetch: false, // Используем кэш если есть
      })
    );

    // Проверяем, есть ли данные и не было ли ошибки
    if (result.error) {
      console.error('Ошибка получения данных пользователя:', result.error);
      return false;
    }

    return result.data?.selectedCourses?.includes(courseId) || false;
  } catch (error) {
    console.error('Ошибка проверки курса пользователя:', error);
    return false;
  }
};

// Функция для подписки на изменения состояния авторизации
export const setupAuthEventListener = (
  callback: (isAuthenticated: boolean) => void
) => {
  if (typeof window === 'undefined') return;

  const handleAuthChange = () => {
    const token = localStorage.getItem('auth_token');
    callback(!!token);
  };

  window.addEventListener('authStateChanged', handleAuthChange);

  // Инициализируем начальное состояние
  handleAuthChange();

  return () => window.removeEventListener('authStateChanged', handleAuthChange);
};