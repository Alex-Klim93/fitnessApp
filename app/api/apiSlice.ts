// app/lib/api/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = 'https://wedev-api.sky.pro/api/fitness';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
      // Критически важно: удаляем Content-Type заголовок
      headers.delete('Content-Type');
      return headers;
    },
  }),
  tagTypes: ['Course', 'User', 'Progress', 'Workout'],
  endpoints: () => ({}),
});
