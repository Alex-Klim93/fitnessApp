// app/lib/api/coursesApi.ts
import { apiSlice } from './apiSlice';

export const coursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCourses: builder.query({
      query: () => '/courses',
      providesTags: ['Course'],
      keepUnusedDataFor: 3600,
    }),

    getCourseById: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
      keepUnusedDataFor: 1800,
    }),

    getCourseWorkouts: builder.query({
      query: (courseId) => `/courses/${courseId}/workouts`,
      providesTags: ['Workout'],
    }),

    resetCourseProgress: builder.mutation({
      query: (courseId) => ({
        url: `/courses/${courseId}/reset`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Progress', 'Course'],
    }),
  }),
});

export const {
  useGetAllCoursesQuery,
  useGetCourseByIdQuery,
  useGetCourseWorkoutsQuery,
  useResetCourseProgressMutation,
} = coursesApi;
