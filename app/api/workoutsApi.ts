// app/lib/api/workoutsApi.ts
import { apiSlice } from './apiSlice';

export const workoutsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWorkoutById: builder.query({
      query: (workoutId) => `/workouts/${workoutId}`,
      providesTags: (result, error, id) => [{ type: 'Workout', id }],
      keepUnusedDataFor: 600, // 10 минут
    }),
  }),
});

export const { useGetWorkoutByIdQuery } = workoutsApi;
