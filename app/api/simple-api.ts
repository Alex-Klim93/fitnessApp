// app/api/simple-api.ts
const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

// Получение заголовков с токеном
const getAuthHeaders = () => {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Базовый fetch с улучшенной обработкой ошибок
const fetchApi = async (url: string, options: RequestInit = {}) => {
  try {
    const headers = getAuthHeaders();

    // Для POST/PATCH/PUT добавляем Content-Type
    const isBodyRequest =
      options.method && ['POST', 'PATCH', 'PUT'].includes(options.method);

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...(isBodyRequest ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    };

    console.log(`API Request to: ${url}`);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = await response.json();
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

    return await response.json();
  } catch (error: any) {
    console.error(`API Error for ${url}:`, error);

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
};

// ========== ВСЕ API ФУНКЦИИ ==========

// 1. КУРСЫ
export const getAllCourses = () => fetchApi(`${API_BASE_URL}/courses`);

export const getCourseById = (_id: string) =>
  fetchApi(`${API_BASE_URL}/courses/${_id}`);

export const getCourseWorkouts = (courseId: string) =>
  fetchApi(`${API_BASE_URL}/courses/${courseId}/workouts`);

export const resetCourseProgress = (courseId: string) =>
  fetchApi(`${API_BASE_URL}/courses/${courseId}/reset`, { method: 'PATCH' });

// 2. ПОЛЬЗОВАТЕЛИ
export const getCurrentUser = () => fetchApi(`${API_BASE_URL}/users/me`);

export const addCourseToUser = (courseId: string) =>
  fetchApi(`${API_BASE_URL}/users/me/courses`, {
    method: 'POST',
    body: JSON.stringify({ courseId }),
  });

export const removeCourseFromUser = (courseId: string) =>
  fetchApi(`${API_BASE_URL}/users/me/courses/${courseId}`, {
    method: 'DELETE',
  });

export const getUserProgress = (courseId: string, workoutId?: string) => {
  let url = `${API_BASE_URL}/users/me/progress?courseId=${courseId}`;
  if (workoutId) {
    url += `&workoutId=${workoutId}`;
  }
  return fetchApi(url);
};

// 3. ТРЕНИРОВКИ
export const getWorkoutById = (workoutId: string) =>
  fetchApi(`${API_BASE_URL}/workouts/${workoutId}`);

export const saveWorkoutProgress = (
  courseId: string,
  workoutId: string,
  progressData: number[]
) =>
  fetchApi(`${API_BASE_URL}/courses/${courseId}/workouts/${workoutId}`, {
    method: 'PATCH',
    body: JSON.stringify({ progressData }),
  });

export const resetWorkoutProgress = (courseId: string, workoutId: string) =>
  fetchApi(`${API_BASE_URL}/courses/${courseId}/workouts/${workoutId}/reset`, {
    method: 'PATCH',
  });
