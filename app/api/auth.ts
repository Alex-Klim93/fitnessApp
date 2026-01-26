// app/api/auth.ts
const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

// Ключи для localStorage
const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'user_email';
const LOGIN_KEY = 'user_login';

// ========== ПРОСТЫЕ ФУНКЦИИ ==========

// Сохранение токена
export const saveToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

// Получение токена
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

// Получение email пользователя
export const getUserEmail = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(EMAIL_KEY);
  }
  return null;
};

// Получение логина пользователя
export const getUserLogin = (): string | null => {
  if (typeof window !== 'undefined') {
    const login = localStorage.getItem(LOGIN_KEY);
    if (login) return login;

    // Если логина нет, но есть email, извлекаем логин из email
    const email = getUserEmail();
    if (email) {
      return email.split('@')[0];
    }
  }
  return null;
};

// Сохранение данных пользователя
export const saveUserData = (email: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(EMAIL_KEY, email);
    const login = email.split('@')[0];
    localStorage.setItem(LOGIN_KEY, login);
  }
};

// Удаление всех данных
export const removeAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(LOGIN_KEY);
  }
};

// Проверка авторизации
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Отправка события
export const dispatchAuthChangeEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authStateChanged'));
  }
};

// Регистрация
export const register = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',

    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
};

// Авторизация
export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  // Сохраняем токен и данные пользователя
  saveToken(data.token);
  saveUserData(email);

  // Уведомляем все компоненты об изменении состояния авторизации
  dispatchAuthChangeEvent();

  return data;
};

// Выход
export const logout = () => {
  removeAuthData();
  dispatchAuthChangeEvent();
};
