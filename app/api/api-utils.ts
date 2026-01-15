// app/api/api-utils.ts
const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

// Валидация email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация пароля
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (
  password: string
): PasswordValidationResult => {
  const errors: string[] = [];

  // Проверка длины
  if (password.length < 6) {
    errors.push('Пароль должен содержать не менее 6 символов');
  }

  // Проверка на заглавные буквы
  if (!/[A-ZА-Я]/.test(password)) {
    errors.push('Пароль должен содержать как минимум одну заглавную букву');
  }

  // Проверка на специальные символы - используем более широкий набор
  // Проверяем, что есть хотя бы ОДИН специальный символ
  // Часто API принимает: ! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  
  if (!specialChars.test(password)) {
    errors.push('Пароль должен содержать хотя бы один специальный символ');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Создание заголовков для авторизованных запросов
export const getAuthHeaders = (): HeadersInit => {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Обертка для fetch с обработкой ошибок
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const defaultOptions: RequestInit = {};

  const mergedOptions: RequestInit = {
    ...defaultOptions,
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // Не удалось распарсить JSON
      }

      throw new Error(errorMessage);
    }

    // Если ответ пустой (например, для DELETE запросов)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
};

// Проверка, является ли ошибка ошибкой авторизации
export const isAuthError = (error: any): boolean => {
  const errorMessage = error.message || error.toString();
  return (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Forbidden') ||
    errorMessage.includes('Требуется авторизация') ||
    errorMessage.includes('Доступ запрещен')
  );
};

// Очистка токена при ошибке авторизации
export const handleAuthError = (error: any): void => {
  if (isAuthError(error)) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('token_timestamp');
    }
  }
};