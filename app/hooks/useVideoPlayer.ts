// app/hooks/useVideoPlayer.ts
import { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  setDuration,
  setCurrentTime,
  playVideo,
  pauseVideo,
} from '../store/slices/videoPlayerSlice';

export const useVideoPlayer = (videoUrl: string | undefined) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { isPlaying, currentTime, volume, isMuted, playbackRate } = useSelector(
    (state: RootState) => state.videoPlayer
  );

  // Установка видео URL и управление воспроизведением
  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    // Установка метаданных
    const handleLoadedMetadata = () => {
      dispatch(setDuration(videoElement.duration));
    };

    // Обновление текущего времени
    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(videoElement.currentTime));
    };

    // Обработка окончания видео
    const handleEnded = () => {
      dispatch(pauseVideo());
    };

    // Установка громкости и скорости воспроизведения
    videoElement.volume = volume;
    videoElement.muted = isMuted;
    videoElement.playbackRate = playbackRate;

    // Управление воспроизведением
    if (isPlaying) {
      videoElement.play().catch((error) => {
        console.error('Ошибка воспроизведения видео:', error);
        dispatch(pauseVideo());
      });
    } else {
      videoElement.pause();
    }

    // Установка текущего времени
    if (Math.abs(videoElement.currentTime - currentTime) > 0.1) {
      videoElement.currentTime = currentTime;
    }

    // Добавление слушателей событий
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, currentTime, volume, isMuted, playbackRate, dispatch]);

  return videoRef;
};
