// app/api/errors.ts

// Функция для получения понятного сообщения об ошибке из API
export const getErrorMessage = (error: any): string => {
  if (!error) return 'Произошла неизвестная ошибка';

  // Если это строка, возвращаем её
  if (typeof error === 'string') return error;

  // Если это объект Error
  if (error instanceof Error) {
    const message = error.message;

    // Парсим сообщения об ошибках API
    if (message.includes('400')) {
      return 'Неверный запрос. Проверьте введенные данные';
    } else if (message.includes('401')) {
      return 'Неверный email или пароль';
    } else if (message.includes('409')) {
      return 'Пользователь с таким email уже существует';
    } else if (message.includes('422')) {
      return 'Некорректные данные. Проверьте введенные значения';
    } else if (message.includes('500')) {
      return 'Ошибка сервера. Пожалуйста, попробуйте позже';
    } else if (message.includes('network') || message.includes('Network')) {
      return 'Ошибка сети. Проверьте подключение к интернету';
    }

    return message || 'Произошла неизвестная ошибка';
  }

  // Если это объект с полем message
  if (error.message && typeof error.message === 'string') {
    return error.message;
  }

  return 'Произошла неизвестная ошибка';
};
