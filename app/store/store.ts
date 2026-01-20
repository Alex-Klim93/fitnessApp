// app/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import coursesReducer from './slices/coursesSlice';
import playerReducer from './slices/playerSlice';
import videoPlayerReducer from './slices/videoPlayerSlice';
import { logger } from './middleware/logger';

const isDevelopment = process.env.NODE_ENV === 'development';

// Проверяем, инициализировано ли уже хранилище на клиенте
let storeInstance: ReturnType<typeof makeStore> | null = null;

const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      courses: coursesReducer,
      player: playerReducer,
      videoPlayer: videoPlayerReducer,
    },
    middleware: (getDefaultMiddleware) => {
      const middleware = getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['videoPlayer/setError', 'videoPlayer/setLoading'],
          ignoredPaths: ['videoPlayer.error'],
        },
        immutableCheck: {
          warnAfter: 100,
        },
      });

      // Добавляем logger только в development
      if (isDevelopment) {
        return middleware.concat(logger);
      }

      return middleware;
    },
    // Упрощаем конфигурацию DevTools - убираем дублирование
    devTools: isDevelopment
      ? {
          name: 'Fitness App',
          trace: true,
          traceLimit: 25,
        }
      : false,
  });
};

export const initializeStore = () => {
  // Для серверного рендеринга всегда создаем новое хранилище
  if (typeof window === 'undefined') {
    return makeStore();
  }

  // Для клиента используем синглтон
  if (!storeInstance) {
    storeInstance = makeStore();
    setupListeners(storeInstance.dispatch);
  }

  return storeInstance;
};

export const store = initializeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Экспортируем синглтон для использования в компонентах
export const getStore = () => {
  if (!storeInstance) {
    throw new Error('Store not initialized. Call initializeStore() first.');
  }
  return storeInstance;
};
