// app/store/middleware/logger.ts
import { Middleware } from '@reduxjs/toolkit';

// Глобальная переменная для отслеживания применения логгера
declare global {
  interface Window {
    __REDUX_LOGGER_APPLIED__?: boolean;
  }
}

export const logger: Middleware = (store) => (next) => (action) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    return next(action);
  }

  // Проверяем, не был ли логгер уже применен
  if (typeof window !== 'undefined' && window.__REDUX_LOGGER_APPLIED__) {
    return next(action);
  }

  // Помечаем логгер как примененный
  if (typeof window !== 'undefined') {
    window.__REDUX_LOGGER_APPLIED__ = true;
  }

  console.groupCollapsed(
    `%cRedux Action: ${action.type}`,
    'color: #764ba2; font-weight: bold'
  );

  console.log(
    '%cPrevious State:',
    'color: #9E9E9E; font-weight: bold',
    store.getState()
  );
  console.log('%cAction:', 'color: #03A9F4; font-weight: bold', action);

  const result = next(action);

  console.log(
    '%cNext State:',
    'color: #4CAF50; font-weight: bold',
    store.getState()
  );
  console.groupEnd();

  return result;
};

// Альтернативная версия без глобальной переменной
export const safeLogger: Middleware = (store) => {
  // Проверяем инициализацию один раз
  let initialized = false;

  return (next) => (action) => {
    if (!initialized) {
      initialized = true;

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '%c🔧 Redux Logger initialized',
          'color: #4CAF50; font-weight: bold'
        );
      }
    }

    if (process.env.NODE_ENV !== 'development') {
      return next(action);
    }

    console.groupCollapsed(
      `%c${action.type}`,
      'color: #673ab7; font-weight: bold'
    );
    console.log('%cPayload:', 'color: #2196f3;', action.payload);
    console.log('%cState before:', 'color: #ff9800;', store.getState());

    const result = next(action);

    console.log('%cState after:', 'color: #4caf50;', store.getState());
    console.groupEnd();

    return result;
  };
};
