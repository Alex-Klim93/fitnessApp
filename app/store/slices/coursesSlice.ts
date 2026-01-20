// app/store/slices/coursesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getAllCourses,
  getCourseById,
  addCourseToUser,
  removeCourseFromUser,
} from '@/app/api/simple-api';

interface Course {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  directions: string[];
  fitting: string[];
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
  workouts: string[];
}

interface CoursesState {
  courses: Course[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

// Получение всех курсов
export const fetchCourses = createAsyncThunk('courses/fetchAll', async () => {
  try {
    const courses = await getAllCourses();
    return courses;
  } catch (error: any) {
    throw new Error(getErrorMessage(error));
  }
});

// Получение курса по ID
export const fetchCourseById = createAsyncThunk(
  'courses/fetchById',
  async (courseId: string) => {
    try {
      const course = await getCourseById(courseId);
      return course;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }
);

// Выбор курса (добавление курса пользователю)
export const selectCourse = createAsyncThunk(
  'courses/select',
  async (courseId: string, { dispatch }) => {
    try {
      await addCourseToUser(courseId);
      // Обновляем данные пользователя после добавления курса
      dispatch(loadUserData());
      return courseId;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }
);

// Отмена выбора курса (удаление курса у пользователя)
export const deselectCourse = createAsyncThunk(
  'courses/deselect',
  async (courseId: string, { dispatch }) => {
    try {
      await removeCourseFromUser(courseId);
      // Обновляем данные пользователя после удаления курса
      dispatch(loadUserData());
      return courseId;
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }
);

// Импортируем loadUserData из authSlice
import { loadUserData } from './authSlice';
import { getErrorMessage } from '@/app/api/errors';

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSelectedCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addCourse: (state, action: PayloadAction<Course>) => {
      if (!state.courses.some((course) => course._id === action.payload._id)) {
        state.courses.push(action.payload);
      }
    },
    removeCourse: (state, action: PayloadAction<string>) => {
      state.courses = state.courses.filter(
        (course) => course._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCourses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки курсов';
      })
      // fetchCourseById
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки курса';
      })
      // selectCourse
      .addCase(selectCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(selectCourse.fulfilled, (state) => {
        state.loading = false;
        // Курс добавлен, обновление пользователя происходит через loadUserData
      })
      .addCase(selectCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка добавления курса';
      })
      // deselectCourse
      .addCase(deselectCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deselectCourse.fulfilled, (state) => {
        state.loading = false;
        // Курс удален, обновление пользователя происходит через loadUserData
      })
      .addCase(deselectCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка удаления курса';
      });
  },
});

export const { setSelectedCourse, clearError, addCourse, removeCourse } =
  coursesSlice.actions;

export default coursesSlice.reducer;
