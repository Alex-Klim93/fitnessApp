// app/api/auth.ts
const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

// Экспортируем AuthError
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

interface User {
  email: string;
  selectedCourses: string[];
}

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

interface ApiError {
  message: string;
}

// Проверка валидности токена (упрощенная проверка)
const isTokenValid = (token: string): boolean => {
  if (!token) return false;

  try {
    // Простая проверка структуры JWT
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Проверяем срок действия (если есть в payload)
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Сохранение токена в localStorage
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_timestamp', Date.now().toString());
  }
};

// Получение токена из localStorage
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Удаление токена (выход)
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_timestamp');
    localStorage.removeItem('current_user');
  }
};

// Проверка авторизации пользователя
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token && isTokenValid(token);
};

// Получение данных текущего пользователя
export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('current_user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
  }
  return null;
};

// Сохранение данных пользователя
const saveCurrentUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('current_user', JSON.stringify(user));
  }
};

// Регистрация пользователя - БЕЗ ЗАГОЛОВКОВ
export const register = async (
  email: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      // БЕЗ ЗАГОЛОВКОВ - только метод и тело
      body: JSON.stringify({ email, password }),
    });

    // Сначала получаем текст ответа
    const responseText = await response.text();

    // Пытаемся распарсить JSON
    let data: RegisterResponse | ApiError;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Если не JSON, создаем сообщение об ошибке
      throw new AuthError(`Ошибка сервера: ${response.status}`);
    }

    if (!response.ok) {
      throw new AuthError((data as ApiError).message);
    }

    // Возвращаем успешный ответ
    return data as RegisterResponse;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // Любую другую ошибку преобразуем в AuthError
    throw new AuthError(
      error instanceof Error
        ? error.message
        : 'Неизвестная ошибка при регистрации'
    );
  }
};

// Авторизация пользователя - БЕЗ ЗАГОЛОВКОВ
export const login = async (email: string, password: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      // БЕЗ ЗАГОЛОВКОВ - только метод и тело
      body: JSON.stringify({ email, password }),
    });

    // Сначала получаем текст ответа
    const responseText = await response.text();

    // Пытаемся распарсить JSON
    let data: LoginResponse | ApiError;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Если не JSON, создаем сообщение об ошибке
      throw new AuthError(`Ошибка сервера: ${response.status}`);
    }

    if (!response.ok) {
      throw new AuthError((data as ApiError).message);
    }

    // Сохраняем токен
    const { token } = data as LoginResponse;
    saveToken(token);

    // Получаем данные пользователя
    await fetchUserData();
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    // Любую другую ошибку преобразуем в AuthError
    throw new AuthError(
      error instanceof Error
        ? error.message
        : 'Неизвестная ошибка при авторизации'
    );
  }
};

// Получение данных пользователя - БЕЗ ЗАГОЛОВКОВ кроме Authorization
export const fetchUserData = async (): Promise<User> => {
  const token = getToken();

  if (!token) {
    throw new AuthError('Пользователь не авторизован');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Сначала получаем текст ответа
    const responseText = await response.text();

    // Пытаемся распарсить JSON
    let data: User | ApiError;
    try {
      data = JSON.parse(responseText);
    } catch {
      // Если не JSON, создаем сообщение об ошибке
      throw new AuthError(`Ошибка сервера: ${response.status}`);
    }

    if (!response.ok) {
      throw new AuthError((data as ApiError).message);
    }

    const user = data as User;
    saveCurrentUser(user);
    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Ошибка при получении данных пользователя');
  }
};

// Выход из системы
export const logout = (): void => {
  removeToken();
};

// Проверка авторизации при старте приложения
export const checkAuthOnStart = async (): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> => {
  if (isAuthenticated()) {
    try {
      const user = await fetchUserData();
      return { isAuthenticated: true, user };
    } catch {
      removeToken();
      return { isAuthenticated: false, user: null };
    }
  }
  return { isAuthenticated: false, user: null };
};
