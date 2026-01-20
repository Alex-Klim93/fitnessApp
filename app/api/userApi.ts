// app/lib/api/userApi.ts
import { apiSlice } from './apiSlice';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
      keepUnusedDataFor: 300,
    }),

    addCourseToUser: builder.mutation({
      query: (courseId) => ({
        url: '/users/me/courses',
        method: 'POST',
        body: JSON.stringify({ courseId }), // Сериализуем вручную
      }),
      invalidatesTags: ['User', 'Course'],
    }),

    removeCourseFromUser: builder.mutation({
      query: (courseId) => ({
        url: `/users/me/courses/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Course', 'Progress'],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useAddCourseToUserMutation,
  useRemoveCourseFromUserMutation,
} = userApi;
