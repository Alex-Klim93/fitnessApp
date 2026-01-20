// app/store/slices/playerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { saveWorkoutProgress } from '@/app/api/simple-api';
import { getErrorMessage } from '@/app/api/errors';

interface PlaybackState {
  currentVideoId: string | null;
  currentTime: number;
  isPlaying: boolean;
  volume: number;
  playbackRate: number;
}

const initialState: PlaybackState = {
  currentVideoId: null,
  currentTime: 0,
  isPlaying: false,
  volume: 1.0,
  playbackRate: 1.0,
};

// Обновление прогресса тренировки
export const updateWorkoutProgress = createAsyncThunk(
  'player/updateProgress',
  async ({
    courseId,
    workoutId,
    progressData,
  }: {
    courseId: string;
    workoutId: string;
    progressData: number[];
  }) => {
    try {
      await saveWorkoutProgress(courseId, workoutId, progressData);
      return { workoutId, progressData };
    } catch (error: any) {
      throw new Error(getErrorMessage(error));
    }
  }
);

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<string>) => {
      state.currentVideoId = action.payload;
      state.currentTime = 0;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setPlaybackRate: (state, action: PayloadAction<number>) => {
      state.playbackRate = action.payload;
    },
    resetPlayer: (state) => {
      state.currentVideoId = null;
      state.currentTime = 0;
      state.isPlaying = false;
      state.volume = 1.0;
      state.playbackRate = 1.0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateWorkoutProgress.fulfilled, (state, action) => {
        console.log('Прогресс тренировки обновлен:', action.payload);
      })
      .addCase(updateWorkoutProgress.rejected, (_, action) => {
        console.error(
          'Failed to update workout progress:',
          action.error.message
        );
      });
  },
});

export const {
  setCurrentVideo,
  setCurrentTime,
  setIsPlaying,
  setVolume,
  setPlaybackRate,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
