import { AuthError } from './auth';

// Функция для получения читаемых сообщений об ошибках
export const getErrorMessage = (error: any): string => {
  // Если это наша AuthError, возвращаем её сообщение
  if (error instanceof AuthError) {
    return error.message;
  }

  // Если это стандартная ошибка
  if (error instanceof Error) {
    // Сетевые ошибки
    if (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed')
    ) {
      return 'Ошибка сети. Проверьте подключение к интернету.';
    }

    // CORS ошибки
    if (
      error.message.includes('CORS') ||
      error.message.includes('cross-origin')
    ) {
      return 'Ошибка подключения к серверу. Пожалуйста, попробуйте позже.';
    }

    return error.message;
  }

  // Если это строка
  if (typeof error === 'string') {
    return error;
  }

  // Если это объект с сообщением
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Произошла неизвестная ошибка. Пожалуйста, попробуйте еще раз.';
};

// Сопоставление ошибок API с пользовательскими сообщениями
export const normalizeErrorMessage = (message: string): string => {
  const errorMessagesMap: Record<string, string> = {
    'Введите корректный Email': 'Введите корректный email адрес',
    'Пользователь с таким email уже существует':
      'Пользователь с таким email уже существует',
    'Пароль должен содержать не менее 6 символов':
      'Пароль должен содержать не менее 6 символов',
    'Пароль должен содержать не менее 2 спецсимволов':
      'Пароль должен содержать не менее 2 специальных символов',
    'Пароль должен содержать как минимум одну заглавную букву':
      'Пароль должен содержать как минимум одну заглавную букву',
    'Пользователь с таким email не найден':
      'Пользователь с таким email не найден',
    'Неверный пароль': 'Неверный пароль',
    Unauthorized: 'Требуется авторизация',
    Forbidden: 'Доступ запрещен',
    'Not Found': 'Ресурс не найден',
    'Internal Server Error': 'Внутренняя ошибка сервера',
  };

  // Проверяем полное соответствие
  if (errorMessagesMap[message]) {
    return errorMessagesMap[message];
  }

  // Проверяем частичные совпадения
  for (const [key, value] of Object.entries(errorMessagesMap)) {
    if (message.includes(key)) {
      return value;
    }
  }

  return message;
};
