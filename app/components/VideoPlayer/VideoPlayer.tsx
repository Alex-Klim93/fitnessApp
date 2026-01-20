import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  videoUrl?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Извлекаем ID видео для YouTube
  const getYouTubeId = (url: string): string => {
    let videoId = '';

    if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('youtube.com/watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('youtube.com/v/')) {
      videoId = url.split('youtube.com/v/')[1]?.split('?')[0] || '';
    }

    return videoId;
  };

  // Загрузка YouTube API
  useEffect(() => {
    if (!isYouTube) return;

    // Если API уже загружен
    if (window.YT && window.YT.Player) {
      console.log('YouTube API уже загружен');
      return;
    }

    // Проверяем, не загружается ли уже API
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      console.log('YouTube API уже загружается');
      return;
    }

    // Загружаем YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.defer = true;

    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Глобальная функция, которую вызовет YouTube API
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API готов к использованию');
    };

    return () => {
      // Очищаем глобальную функцию при размонтировании
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, [isYouTube]);

  // Инициализация YouTube плеера
  useEffect(() => {
    if (!videoUrl || !isYouTube || !playerContainerRef.current) {
      console.log('Недостаточно условий для инициализации YouTube плеера');
      return;
    }

    const videoId = getYouTubeId(videoUrl);
    if (!videoId) {
      console.log('Не удалось извлечь YouTube ID');
      setIsYouTube(false);
      return;
    }

    console.log('Инициализация YouTube плеера с ID:', videoId);

    // Очищаем контейнер
    if (playerContainerRef.current) {
      playerContainerRef.current.innerHTML = '';
    }

    // Функция инициализации плеера
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        console.log(
          'YouTube API еще не загружен, повторная попытка через 500мс'
        );
        setTimeout(initPlayer, 500);
        return;
      }

      // Удаляем предыдущий плеер, если существует
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          console.log('Ошибка при уничтожении предыдущего плеера:', e);
        }
      }

      try {
        // Создаем новый плеер
        youtubePlayerRef.current = new window.YT.Player(
          playerContainerRef.current,
          {
            videoId: videoId,
            width: '100%',
            height: '100%',
            playerVars: {
              rel: 0,
              modestbranding: 1,
              controls: 0, // Скрываем стандартные элементы управления
              disablekb: 0, // Разрешаем клавиатуру
              enablejsapi: 1, // Включаем API
              iv_load_policy: 3,
              playsinline: 1,
              autoplay: 0,
              fs: 1, // Разрешаем полноэкранный режим
              origin:
                typeof window !== 'undefined'
                  ? window.location.origin
                  : 'http://localhost:3000',
            },
            events: {
              onReady: (event: any) => {
                console.log('YouTube Player готов');
                setIsYouTubeReady(true);
                setPlayerError(false);
                setDuration(event.target.getDuration());

                // Устанавливаем размеры iframe
                const iframe =
                  playerContainerRef.current?.querySelector('iframe');
                if (iframe) {
                  iframe.style.width = '100%';
                  iframe.style.height = '100%';
                  iframe.style.borderRadius = '30px';
                  iframe.style.border = 'none';
                }
              },
              onStateChange: (event: any) => {
                console.log('Состояние YouTube плеера изменилось:', event.data);
                switch (event.data) {
                  case window.YT.PlayerState.PLAYING:
                    setIsPlaying(true);
                    break;
                  case window.YT.PlayerState.PAUSED:
                  case window.YT.PlayerState.ENDED:
                    setIsPlaying(false);
                    break;
                }
              },
              onError: (error: any) => {
                console.error('Ошибка YouTube плеера:', error);
                setPlayerError(true);
                setIsYouTubeReady(false);
              },
            },
          }
        );
      } catch (error) {
        console.error('Ошибка при создании YouTube плеера:', error);
        setPlayerError(true);
        setIsYouTubeReady(false);
      }
    };

    // Запускаем инициализацию
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Ждем загрузки API
      const checkYTInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkYTInterval);
          initPlayer();
        }
      }, 100);

      // Таймаут на случай, если API не загрузится
      setTimeout(() => {
        clearInterval(checkYTInterval);
        if (!window.YT || !window.YT.Player) {
          console.error('YouTube API не загрузился в течение 5 секунд');
          setPlayerError(true);
        }
      }, 5000);
    }

    // Обновляем текущее время
    const updateTimeInterval = setInterval(() => {
      if (
        youtubePlayerRef.current &&
        youtubePlayerRef.current.getCurrentTime &&
        typeof youtubePlayerRef.current.getCurrentTime === 'function'
      ) {
        try {
          const time = youtubePlayerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (e) {
          console.log('Ошибка при получении текущего времени:', e);
        }
      }
    }, 100);

    return () => {
      clearInterval(updateTimeInterval);
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
          youtubePlayerRef.current = null;
        } catch (e) {
          console.log('Ошибка при уничтожении плеера:', e);
        }
      }
    };
  }, [videoUrl, isYouTube]);

  // Определяем тип видео при изменении videoUrl
  useEffect(() => {
    if (!videoUrl) return;

    try {
      new URL(videoUrl);
    } catch {
      setIsYouTube(false);
      return;
    }

    const youtubePattern = /youtube\.com|youtu\.be/;
    if (youtubePattern.test(videoUrl)) {
      console.log('Обнаружено YouTube видео');
      setIsYouTube(true);
      setPlayerError(false);
      setIsYouTubeReady(false);
    } else {
      console.log('Не YouTube видео');
      setIsYouTube(false);
    }
  }, [videoUrl]);

  // Обработчики для кастомных элементов управления
  const handlePlayPause = () => {
    if (!isYouTubeReady || !youtubePlayerRef.current) {
      console.log('Плеер не готов для управления');
      return;
    }

    try {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    } catch (error) {
      console.error('Ошибка при управлении воспроизведением:', error);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isYouTubeReady || !youtubePlayerRef.current || duration <= 0) return;

    try {
      const percentage = parseFloat(e.target.value);
      const newTime = (percentage / 100) * duration;
      youtubePlayerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Ошибка при перемотке:', error);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleContainerClick = () => {
    setShowControls(!showControls);
  };

  const handleMouseEnter = () => {
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    setShowControls(false);
  };

  // Если videoUrl пустой или undefined
  if (!videoUrl) {
    return (
      <div className={styles.Player__box}>
        <Image
          width={156}
          height={156}
          className={styles.Player__img}
          src="/img/Subtract.svg"
          alt="Subtract"
          priority
        />
        <p className={styles.noVideoText}>Видео тренировки не загружено</p>
      </div>
    );
  }

  // Проверяем, является ли URL валидным
  try {
    new URL(videoUrl);
  } catch {
    return (
      <div className={styles.Player__box}>
        <Image
          width={156}
          height={156}
          className={styles.Player__img}
          src="/img/Subtract.svg"
          alt="Subtract"
          priority
        />
        <p className={styles.noVideoText}>Некорректная ссылка на видео</p>
      </div>
    );
  }

  // Если это YouTube
  if (isYouTube) {
    return (
      <div
        className={styles.Player__box}
        onClick={handleContainerClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Контейнер для YouTube плеера */}
        <div
          ref={playerContainerRef}
          className={styles.videoContainer}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            borderRadius: '30px',
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        />

        {/* Сообщение об ошибке */}
        {playerError && (
          <div className={styles.Player__content}>
            <Image
              width={156}
              height={156}
              className={styles.Player__img}
              src="/img/Subtract.svg"
              alt="Subtract"
              priority
            />
            <p className={styles.noVideoText}>
              Не удалось загрузить YouTube видео
            </p>
          </div>
        )}

        {/* Индикатор загрузки */}
        {!isYouTubeReady && !playerError && (
          <div className={styles.Player__content}>
            <Image
              width={156}
              height={156}
              className={styles.Player__img}
              src="/img/Subtract.svg"
              alt="Subtract"
              priority
            />
            <p className={styles.noVideoText}>Загрузка YouTube плеера...</p>
          </div>
        )}

        {/* Кастомные элементы управления */}
        {isYouTubeReady && (showControls || !isPlaying) && (
          <>
            {/* Кнопка Play/Pause */}
            <button
              className={`${styles.playPauseButton} ${isPlaying ? styles.playing : styles.paused}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
            >
              <span className={styles.playIcon}>▶</span>
              <span className={styles.pauseIcon}>⏸</span>
            </button>

            {/* Панель управления */}
            <div
              className={styles.customControls}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Прогресс бар */}
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{
                      width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                    }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="0.1"
                    value={duration > 0 ? (currentTime / duration) * 100 : 0}
                    onChange={handleSeek}
                    className={styles.progressSlider}
                  />
                </div>
                <div className={styles.timeDisplay}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Если это не YouTube URL, используем HTML5 video
  return (
    <div className={styles.Player__box}>
      <video
        controls
        width="100%"
        height="100%"
        className={styles.videoElement}
        key={videoUrl}
        style={{ borderRadius: '30px' }}
      >
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не поддерживает видео тег.
      </video>
    </div>
  );
}
