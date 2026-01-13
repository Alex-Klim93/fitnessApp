const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

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

// Сохранение токена
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token_timestamp', Date.now().toString());
  }
};

// Получение токена
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// Удаление токена
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('token_timestamp');
  }
};

// Проверка авторизации
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token && token.length > 10;
};

// Получение данных пользователя
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

// Регистрация пользователя - УПРОЩЕННАЯ ВЕРСИЯ
export const register = async (
  email: string,
  password: string
): Promise<{ message: string }> => {
  console.log('Register attempt:', { email, password });

  // Проверяем пароль по требованиям API
  if (password.length < 6) {
    throw new AuthError('Пароль должен содержать не менее 6 символов');
  }

  if (!/[A-ZА-Я]/.test(password)) {
    throw new AuthError(
      'Пароль должен содержать как минимум одну заглавную букву'
    );
  }

  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const specialCharMatches = password.match(specialChars) || [];
  if (specialCharMatches.length < 2) {
    throw new AuthError(
      'Пароль должен содержать не менее 2 специальных символов'
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });

    console.log('Register response status:', response.status);

    // Если статус не 200, пытаемся прочитать текст
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Register error text:', errorText);

      // Пытаемся распарсить как JSON
      try {
        const errorJson = JSON.parse(errorText);
        throw new AuthError(errorJson.message || errorText);
      } catch {
        throw new AuthError(errorText || `Ошибка ${response.status}`);
      }
    }

    const responseText = await response.text();
    console.log('Register success text:', responseText);

    try {
      const data = JSON.parse(responseText);
      return data;
    } catch {
      return { message: responseText };
    }
  } catch (error: any) {
    console.error('Register fetch error:', error);

    if (error instanceof AuthError) {
      throw error;
    }

    if (error.message?.includes('Failed to fetch')) {
      throw new AuthError('Ошибка сети. Проверьте подключение к интернету.');
    }

    throw new AuthError(error.message || 'Ошибка при регистрации');
  }
};

// Авторизация пользователя - УПРОЩЕННАЯ ВЕРСИЯ
export const login = async (email: string, password: string): Promise<void> => {
  console.log('Login attempt:', { email, password });

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });

    console.log('Login response status:', response.status);

    // Если статус не 200, пытаемся прочитать текст
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Login error text:', errorText);

      // Пытаемся распарсить как JSON
      try {
        const errorJson = JSON.parse(errorText);
        throw new AuthError(errorJson.message || errorText);
      } catch {
        throw new AuthError(errorText || `Ошибка ${response.status}`);
      }
    }

    const responseText = await response.text();
    console.log('Login success text:', responseText);

    let token;
    try {
      const data = JSON.parse(responseText);
      token = data.token;
    } catch {
      // Если не JSON, возможно токен пришел как чистый текст
      token = responseText;
    }

    if (!token) {
      throw new AuthError('Токен не получен от сервера');
    }

    saveToken(token);

    // Пытаемся получить данные пользователя
    try {
      await fetchUserData();
    } catch (userError) {
      console.warn('Failed to fetch user data after login:', userError);
      // Но все равно считаем авторизацию успешной, если есть токен
    }
  } catch (error: any) {
    console.error('Login fetch error:', error);

    if (error instanceof AuthError) {
      throw error;
    }

    if (error.message?.includes('Failed to fetch')) {
      throw new AuthError('Ошибка сети. Проверьте подключение к интернету.');
    }

    throw new AuthError(error.message || 'Ошибка при авторизации');
  }
};

// Получение данных пользователя
export const fetchUserData = async (): Promise<User> => {
  const token = getToken();

  if (!token) {
    throw new AuthError('Пользователь не авторизован');
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new AuthError(errorText || 'Ошибка получения данных пользователя');
  }

  const data = await response.json();
  saveCurrentUser(data);
  return data;
};

// Выход
export const logout = (): void => {
  removeToken();
};

// Проверка авторизации при старте
export const checkAuthOnStart = async (): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> => {
  if (isAuthenticated()) {
    try {
      const user = await fetchUserData();
      return { isAuthenticated: true, user };
    } catch (error) {
      console.error('Auth check failed:', error);
      removeToken();
      return { isAuthenticated: false, user: null };
    }
  }
  return { isAuthenticated: false, user: null };
};
