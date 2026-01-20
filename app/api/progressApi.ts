// app/lib/api/progressApi.ts
import { apiSlice } from './apiSlice';

interface WorkoutProgressParams {
  courseId: string;
  workoutId?: string;
}

interface SaveWorkoutProgressParams {
  courseId: string;
  workoutId: string;
  progressData: number[];
}

interface ResetWorkoutProgressParams {
  courseId: string;
  workoutId: string;
}

export const progressApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProgress: builder.query({
      query: ({ courseId, workoutId }: WorkoutProgressParams) => {
        let url = `/users/me/progress?courseId=${courseId}`;
        if (workoutId) {
          url += `&workoutId=${workoutId}`;
        }
        return url;
      },
      providesTags: ['Progress'],
      keepUnusedDataFor: 60,
    }),

    saveWorkoutProgress: builder.mutation({
      query: ({
        courseId,
        workoutId,
        progressData,
      }: SaveWorkoutProgressParams) => ({
        url: `/courses/${courseId}/workouts/${workoutId}`,
        method: 'PATCH',
        body: { progressData }, // RTK Query автоматически сериализует без Content-Type
      }),
      invalidatesTags: ['Progress'],
    }),

    resetWorkoutProgress: builder.mutation({
      query: ({ courseId, workoutId }: ResetWorkoutProgressParams) => ({
        url: `/courses/${courseId}/workouts/${workoutId}/reset`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Progress'],
    }),
  }),
});

export const {
  useGetUserProgressQuery,
  useSaveWorkoutProgressMutation,
  useResetWorkoutProgressMutation,
} = progressApi;
