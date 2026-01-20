// app/store/slices/videoPlayerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoPlayerState {
  currentVideoUrl: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: VideoPlayerState = {
  currentVideoUrl: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,
  playbackRate: 1,
  isFullscreen: false,
  isLoading: false,
  error: null,
};

const videoPlayerSlice = createSlice({
  name: 'videoPlayer',
  initialState,
  reducers: {
    setVideoUrl: (state, action: PayloadAction<string | null>) => {
      state.currentVideoUrl = action.payload;
      state.currentTime = 0;
      state.isPlaying = false;
      state.isLoading = true;
      state.error = null;
    },

    playVideo: (state) => {
      state.isPlaying = true;
      state.error = null;
    },

    pauseVideo: (state) => {
      state.isPlaying = false;
    },

    togglePlay: (state) => {
      state.isPlaying = !state.isPlaying;
      state.error = null;
    },

    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },

    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
      state.isLoading = false;
    },

    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = Math.max(0, Math.min(1, action.payload));
      state.isMuted = state.volume === 0;
    },

    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
      if (state.isMuted) {
        state.volume = 0;
      } else if (state.volume === 0) {
        state.volume = 0.5;
      }
    },

    setPlaybackRate: (state, action: PayloadAction<number>) => {
      const validRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
      state.playbackRate = validRates.includes(action.payload)
        ? action.payload
        : Math.max(0.25, Math.min(2, action.payload));
    },

    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },

    seekForward: (state) => {
      state.currentTime = Math.min(state.currentTime + 10, state.duration);
    },

    seekBackward: (state) => {
      state.currentTime = Math.max(state.currentTime - 10, 0);
    },

    seekTo: (state, action: PayloadAction<number>) => {
      state.currentTime = Math.max(0, Math.min(action.payload, state.duration));
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      if (action.payload) {
        state.isPlaying = false;
      }
    },

    resetVideoPlayer: (state) => {
      return initialState;
    },

    restoreVideoState: (
      state,
      action: PayloadAction<Partial<VideoPlayerState>>
    ) => {
      return { ...state, ...action.payload };
    },
  },
});

export const {
  setVideoUrl,
  playVideo,
  pauseVideo,
  togglePlay,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleMute,
  setPlaybackRate,
  toggleFullscreen,
  seekForward,
  seekBackward,
  seekTo,
  setLoading,
  setError,
  resetVideoPlayer,
  restoreVideoState,
} = videoPlayerSlice.actions;

export default videoPlayerSlice.reducer;
