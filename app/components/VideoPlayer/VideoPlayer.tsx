import { useRef, useState } from 'react';
import Image from 'next/image';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  videoUrl?: string;
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  // Если videoUrl пустой или undefined
  if (!videoUrl) {
    return (
      <div className={styles.Player__box}>
        <Image
          width={100}
          height={639}
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
          width={100}
          height={639}
          className={styles.Player__img}
          src="/img/Subtract.svg"
          alt="Subtract"
          priority
        />
        <p className={styles.noVideoText}>Некорректная ссылка на видео</p>
      </div>
    );
  }

  // Определяем тип видео по расширению
  const isYouTube = /youtube\.com|youtu\.be/.test(videoUrl);

  if (isYouTube) {
    // Простая обработка YouTube видео
    let videoId = '';

    if (videoUrl.includes('youtube.com/embed/')) {
      videoId = videoUrl.split('youtube.com/embed/')[1]?.split('?')[0] || '';
    } else if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = videoUrl.split('youtube.com/watch?v=')[1]?.split('&')[0] || '';
    }

    if (videoId) {
      const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

      return (
        <div className={styles.Player__box}>
          <div
            className={styles.videoContainer}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: '#000',
            }}
          >
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
              style={{
                border: 'none',
              }}
            />
          </div>
        </div>
      );
    }
  }

  // Для обычных видео файлов
  return (
    <div className={styles.Player__box}>
      <video
        ref={videoRef}
        controls
        width="100%"
        height="100%"
        className={styles.videoElement}
        style={{
          display: hasError ? 'none' : 'block',
        }}
        onError={() => setHasError(true)}
      >
        <source src={videoUrl} type="video/mp4" />
        Ваш браузер не поддерживает видео тег.
      </video>

      {hasError && (
        <div className={styles.Player__content}>
          <Image
            width={100}
            height={639}
            className={styles.Player__img}
            src="/img/Subtract.svg"
            alt="Subtract"
            priority
          />
          <p className={styles.noVideoText}>Не удалось загрузить видео</p>
        </div>
      )}
    </div>
  );
}
