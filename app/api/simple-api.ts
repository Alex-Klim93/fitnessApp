// app/api/simple-api.ts
const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

// Интерфейсы
export interface Course {
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

export interface UserData {
  _id: string;
  email: string;
  selectedCourses: string[];
  courseProgress?: any[]; // Это оставляю, т.к. не знаю точной структуры
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Workout {
  _id: string;
  name: string;
  video: string;
  exercises: Array<{
    name: string;
    quantity: number;
    _id: string;
  }>;
}

export interface ProgressData {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: Array<{
    workoutId: string;
    workoutCompleted: boolean;
    progressData: number[];
    _id: string;
  }>;
}

// Получение заголовков с токеном
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // НЕ добавляем Content-Type
  return headers;
};

// Базовый fetch с улучшенной обработкой ошибок
const fetchApi = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const headers = getAuthHeaders();

    // Для POST/PATCH/PUT НЕ добавляем Content-Type
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    };

    // Удаляем Content-Type если он есть
    if (requestOptions.headers instanceof Headers) {
      requestOptions.headers.delete('Content-Type');
    } else if (Array.isArray(requestOptions.headers)) {
      requestOptions.headers = requestOptions.headers.filter(
        ([key]) => key.toLowerCase() !== 'content-type'
      );
    } else if (typeof requestOptions.headers === 'object') {
      delete (requestOptions.headers as Record<string, string>)['Content-Type'];
      delete (requestOptions.headers as Record<string, string>)['content-type'];
    }

    console.log(`API Request to: ${url}`);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = (await response.json()) as { message?: string };
        errorMessage = errorData.message || errorMessage;
      } catch {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch {
          // Оставляем стандартное сообщение
        }
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`API Error for ${url}:`, error);

    if (error instanceof Error) {
      // Более понятные сообщения об ошибках
      if (error.message.includes('Failed to fetch')) {
        throw new Error(
          'Не удалось подключиться к серверу. Проверьте интернет-соединение.'
        );
      }

      if (error.message.includes('401')) {
        // Удаляем невалидный токен
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }

      throw error;
    }

    throw new Error('Произошла неизвестная ошибка');
  }
};

// ========== ВСЕ API ФУНКЦИИ ==========

// 1. КУРСЫ
export const getAllCourses = (): Promise<Course[]> =>
  fetchApi<Course[]>(`${API_BASE_URL}/courses`);

export const getCourseById = (_id: string): Promise<Course> =>
  fetchApi<Course>(`${API_BASE_URL}/courses/${_id}`);

export const getCourseWorkouts = (courseId: string): Promise<Workout[]> =>
  fetchApi<Workout[]>(`${API_BASE_URL}/courses/${courseId}/workouts`);

export const resetCourseProgress = (
  courseId: string
): Promise<{ message: string }> =>
  fetchApi<{ message: string }>(`${API_BASE_URL}/courses/${courseId}/reset`, {
    method: 'PATCH',
  });

// 2. ПОЛЬЗОВАТЕЛИ
export const getCurrentUser = (): Promise<UserData> =>
  fetchApi<UserData>(`${API_BASE_URL}/users/me`);

export const addCourseToUser = (
  courseId: string
): Promise<{ message: string }> =>
  fetchApi<{ message: string }>(`${API_BASE_URL}/users/me/courses`, {
    method: 'POST',
    body: JSON.stringify({ courseId }), // Сериализуем вручную
  });

export const removeCourseFromUser = (
  courseId: string
): Promise<{ message: string }> =>
  fetchApi<{ message: string }>(
    `${API_BASE_URL}/users/me/courses/${courseId}`,
    {
      method: 'DELETE',
    }
  );

export const getUserProgress = (
  courseId: string,
  workoutId?: string
): Promise<ProgressData> => {
  let url = `${API_BASE_URL}/users/me/progress?courseId=${courseId}`;
  if (workoutId) {
    url += `&workoutId=${workoutId}`;
  }
  return fetchApi<ProgressData>(url);
};

// 3. ТРЕНИРОВКИ
export const getWorkoutById = (workoutId: string): Promise<Workout> =>
  fetchApi<Workout>(`${API_BASE_URL}/workouts/${workoutId}`);

export const saveWorkoutProgress = (
  courseId: string,
  workoutId: string,
  progressData: number[]
): Promise<{ message: string }> =>
  fetchApi<{ message: string }>(
    `${API_BASE_URL}/courses/${courseId}/workouts/${workoutId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ progressData }), // Сериализуем вручную
    }
  );

export const resetWorkoutProgress = (
  courseId: string,
  workoutId: string
): Promise<{ message: string }> =>
  fetchApi<{ message: string }>(
    `${API_BASE_URL}/courses/${courseId}/workouts/${workoutId}/reset`,
    {
      method: 'PATCH',
    }
  );
