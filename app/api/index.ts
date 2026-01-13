// Экспорт всех API функций для удобного импорта

// Auth
export {
  register,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  fetchUserData,
  checkAuthOnStart,
  getToken,
  removeToken,
  saveToken,
  AuthError,
} from './auth';

// Errors
export { getErrorMessage, normalizeErrorMessage } from './errors';

// Utils
export {
  isValidEmail,
  validatePassword,
  getAuthHeaders,
  apiFetch,
  isAuthError,
  handleAuthError,
} from './api-utils';

// Auth checker
export { startTokenRefreshMonitor } from './auth-checker';
