// app/store/slices/coursesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/app/api/errors';

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

// Убираем зависимости от API функций, так как теперь используем RTK Query
const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSelectedCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload;
    },
    setCourses: (state, action: PayloadAction<Course[]>) => {
      state.courses = action.payload;
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
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSelectedCourse,
  setCourses,
  addCourse,
  removeCourse,
  clearError,
} = coursesSlice.actions;

export default coursesSlice.reducer;
