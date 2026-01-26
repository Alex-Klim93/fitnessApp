// app/store/types.ts

// Типы для пользователя
export interface User {
  email: string;
  selectedCourses: string[];
}

// Типы для курсов
export interface Course {
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

// Типы для тренировок/видео
export interface Workout {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // в секундах
  order: number;
}

export interface PlaybackState {
  currentVideoId: string | null;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
}

// Состояние приложения
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  courses: Course[];
  selectedCourse: Course | null;
  playback: PlaybackState;
}

// Типы для ответов API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface LoginResponse {
  token: string;
}
