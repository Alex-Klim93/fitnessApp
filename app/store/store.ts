// app/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import playerReducer from './slices/playerSlice';
import videoPlayerReducer from './slices/videoPlayerSlice';
import { logger } from './middleware/logger';
import { apiSlice } from '../api/apiSlice';

const isDevelopment = process.env.NODE_ENV === 'development';

let storeInstance: ReturnType<typeof makeStore> | null = null;

const makeStore = () => {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
      auth: authReducer,
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
      }).concat(apiSlice.middleware);

      if (isDevelopment) {
        return middleware.concat(logger);
      }

      return middleware;
    },
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
  if (typeof window === 'undefined') {
    return makeStore();
  }

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

export const getStore = () => {
  if (!storeInstance) {
    throw new Error('Store not initialized. Call initializeStore() first.');
  }
  return storeInstance;
};
