// app/ssr/serverUtils.ts
import { Course, UserData } from '@/app/api/simple-api';

export const fetchCoursesStatic = async (): Promise<Course[]> => {
  try {
    const response = await fetch(
      'https://wedev-api.sky.pro/api/fitness/courses'
    );
    if (!response.ok) throw new Error('Failed to fetch courses');
    const data = await response.json();
    return data as Course[];
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
};

export const fetchCourseStatic = async (id: string): Promise<Course> => {
  try {
    const response = await fetch(
      `https://wedev-api.sky.pro/api/fitness/courses/${id}`
    );
    if (!response.ok) throw new Error('Failed to fetch course');
    const data = await response.json();
    return data as Course;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

export const fetchUserDataServerSide = async (): Promise<UserData | null> => {
  // На сервере всегда возвращаем null, т.к. нет localStorage
  return null;
};
