// app/utils/userCourseUtils.ts
import { Course } from '@/app/api/simple-api';
import { isAuthenticated } from '@/app/api/auth';

// Используем RTK Query хуки через функцию
export const getUserValidCourses = async (): Promise<Course[]> => {
  if (!isAuthenticated()) {
    return [];
  }

  try {
    // Получаем данные пользователя через API
    const token = localStorage.getItem('auth_token');
    const userResponse = await fetch(
      'https://wedev-api.sky.pro/api/fitness/users/me',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`HTTP ${userResponse.status}`);
    }

    const userData = await userResponse.json();

    if (!userData.user || !userData.user.selectedCourses) {
      return [];
    }

    // Получаем все курсы
    const coursesResponse = await fetch(
      'https://wedev-api.sky.pro/api/fitness/courses'
    );
    if (!coursesResponse.ok) {
      throw new Error(`HTTP ${coursesResponse.status}`);
    }

    const allCourses: Course[] = await coursesResponse.json();

    // Фильтруем курсы пользователя
    const userCourses = allCourses.filter((course) =>
      userData.user.selectedCourses.includes(course._id)
    );

    console.log('Найдено курсов пользователя:', userCourses.length);
    return userCourses;
  } catch (error) {
    console.error('Ошибка при получении курсов пользователя:', error);
    return [];
  }
};