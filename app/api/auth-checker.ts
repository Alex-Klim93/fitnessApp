import { checkAuthOnStart as checkAuth } from './auth';

// Re-export для удобства
export { checkAuthOnStart } from './auth';

// Функция для периодической проверки токена
export const startTokenRefreshMonitor = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const checkTokenValidity = () => {
    const token = localStorage.getItem('auth_token');
    const timestamp = localStorage.getItem('token_timestamp');

    if (token && timestamp) {
      const tokenAge = Date.now() - parseInt(timestamp, 10);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (tokenAge > 6.5 * 24 * 60 * 60 * 1000) {
        console.warn('Token will expire soon. Consider refreshing.');
      }
    }
  };

  const intervalId = setInterval(checkTokenValidity, 10 * 60 * 1000);

  return () => clearInterval(intervalId);
};
