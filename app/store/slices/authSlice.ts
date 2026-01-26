// app/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { login as apiLogin, logout as apiLogout } from "@/app/api/auth";
import { getErrorMessage } from "@/app/api/errors";

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

// Удаляем старую функцию loadUserData и заменяем её на loadUserProfile
export const loadUserProfile = createAsyncThunk(
  "auth/loadUserProfile",
  async (_, { rejectWithValue }) => {
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      return null;
    }

    try {
      // Данные теперь загружаются через RTK Query в компонентах
      // Эта функция используется только для установки состояния в Redux
      const userFromLocalStorage = localStorage.getItem("user_email");
      if (userFromLocalStorage) {
        const coursesFromStorage = localStorage.getItem("user_courses");
        return {
          _id: "temp-id", // Временный ID, будет заменен RTK Query
          email: userFromLocalStorage,
          selectedCourses: coursesFromStorage
            ? JSON.parse(coursesFromStorage)
            : [],
        };
      }
      return null;
    } catch (error) {
      console.error("Ошибка загрузки данных пользователя:", error);
      if (error instanceof Error) {
        return rejectWithValue(getErrorMessage(error));
      }
      return rejectWithValue("Неизвестная ошибка загрузки данных пользователя");
    }
  },
);

// Вход
export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { dispatch },
  ) => {
    try {
      await apiLogin(email, password);
      // Загружаем профиль после успешного входа
      await dispatch(loadUserProfile());
      return { email };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(getErrorMessage(error));
      }
      throw new Error("Неизвестная ошибка входа");
    }
  },
);

// Выход
export const logout = createAsyncThunk("auth/logout", async () => {
  apiLogout();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
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
          (id) => id !== action.payload,
        );
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadUserProfile
      .addCase(loadUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Ошибка загрузки профиля";
      })
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка входа";
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
  updateUser,
  updateUserCourses,
  addUserCourse,
  removeUserCourse,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
