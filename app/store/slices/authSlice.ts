// app/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCurrentUser } from '@/app/api/simple-api';
import { login as apiLogin, logout as apiLogout } from '@/app/api/auth';
import { getErrorMessage } from '@/app/api/errors';

// Интерфейс пользователя
export interface User {
  _id: string;
  email: string;
  selectedCourses: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Функция для загрузки данных пользователя с сервера
export const loadUserData = createAsyncThunk('auth/loadUserData', async () => {
  console.log('loadUserData: Начинаю загрузку данных пользователя...');

  if (typeof window === 'undefined') {
    console.log('loadUserData: window не определен');
    return null;
  }

  try {
    console.log('loadUserData: Отправляю запрос к API...');

    const userData = await getCurrentUser();
    console.log('loadUserData: Данные получены:', userData);

    // Гарантируем, что selectedCourses - массив
    const user: User = {
      _id: userData._id,
      email: userData.email || '',
      selectedCourses: Array.isArray(userData.selectedCourses)
        ? userData.selectedCourses
        : [],
    };

    console.log('loadUserData: Возвращаю пользователя:', user);
    return user;
  } catch (error: any) {
    console.error('Ошибка загрузки данных пользователя:', error);

    // Если ошибка 401 - токен невалидный, удаляем его
    if (error.message?.includes('401')) {
      console.log('loadUserData: Токен невалидный (401), удаляю...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_login');
    }

    return null;
  }
});

// Вход
export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { dispatch }
  ) => {
    console.log('login: Начинаю вход для', email);

    try {
      await apiLogin(email, password);
      console.log('login: Успешный вход');

      // После успешного входа загружаем данные пользователя
      await dispatch(loadUserData());

      return { email };
    } catch (error: any) {
      console.error('login: Ошибка входа:', error);
      throw new Error(getErrorMessage(error));
    }
  }
);

// Выход
export const logout = createAsyncThunk('auth/logout', async () => {
  console.log('logout: Выход из системы');
  apiLogout();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateUserCourses: (state, action: PayloadAction<string[]>) => {
      if (state.user) {
        state.user.selectedCourses = action.payload;
      }
    },
    addUserCourse: (state, action: PayloadAction<string>) => {
      if (state.user) {
        if (!state.user.selectedCourses.includes(action.payload)) {
          state.user.selectedCourses.push(action.payload);
        }
      }
    },
    removeUserCourse: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.selectedCourses = state.user.selectedCourses.filter(
          (id) => id !== action.payload
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadUserData
      .addCase(loadUserData.pending, (state) => {
        console.log('Redux: loadUserData.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserData.fulfilled, (state, action) => {
        console.log('Redux: loadUserData.fulfilled', action.payload);
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadUserData.rejected, (state, action) => {
        console.log('Redux: loadUserData.rejected', action.error);
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки данных';
      })
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Данные пользователя уже загружены через loadUserData
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка входа';
      })
      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const {
  setUser,
  updateUserCourses,
  addUserCourse,
  removeUserCourse,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
