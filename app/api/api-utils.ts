const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

// Валидация email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация пароля по требованиям API
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (
  password: string
): PasswordValidationResult => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Пароль должен содержать не менее 6 символов');
  }

  if (!/[A-ZА-Я]/.test(password)) {
    errors.push('Пароль должен содержать как минимум одну заглавную букву');
  }

  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  const specialCharMatches = password.match(specialChars) || [];
  if (specialCharMatches.length < 2) {
    errors.push('Пароль должен содержать не менее 2 специальных символов');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Проверка, является ли ошибка ошибкой авторизации
export const isAuthError = (error: any): boolean => {
  const errorMessage = error.message || error.toString();
  return (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Forbidden') ||
    errorMessage.includes('Требуется авторизация') ||
    errorMessage.includes('Доступ запрещен') ||
    errorMessage.includes('Пользователь не авторизован')
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
