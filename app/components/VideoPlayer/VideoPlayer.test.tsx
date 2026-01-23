import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoPlayer from './VideoPlayer';

describe('VideoPlayer Component', () => {
  test('отображает сообщение об ошибке при отсутствии видео URL', () => {
    render(<VideoPlayer videoUrl="" />);

    expect(
      screen.getByText(/Видео тренировки не загружено/i)
    ).toBeInTheDocument();
  });

  test('отображает сообщение об ошибке при некорректном URL', () => {
    render(<VideoPlayer videoUrl="not-a-valid-url" />);

    expect(
      screen.getByText(/Некорректная ссылка на видео/i)
    ).toBeInTheDocument();
  });

  test('отображает YouTube видео если URL содержит youtube.com', () => {
    const youtubeUrl = 'https://www.youtube.com/watch?v=test123';

    render(<VideoPlayer videoUrl={youtubeUrl} />);

    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('youtube.com/embed/test123')
    );
  });

  test('отображает обычное видео для MP4 файлов', () => {
    const mp4Url = 'https://example.com/video.mp4';

    render(<VideoPlayer videoUrl={mp4Url} />);

    // Вместо role="application" ищем видео по другим атрибутам
    const videoElement = screen
      .getByText('Ваш браузер не поддерживает видео тег.')
      .closest('video');
    expect(videoElement).toBeInTheDocument();

    const sourceElement = videoElement?.querySelector('source');
    expect(sourceElement).toHaveAttribute('src', mp4Url);
    expect(sourceElement).toHaveAttribute('type', 'video/mp4');
  });

  test('обрабатывает YouTube embed URL', () => {
    const embedUrl = 'https://www.youtube.com/embed/test456';

    render(<VideoPlayer videoUrl={embedUrl} />);

    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('test456'));
  });

  test('обрабатывает youtu.be короткие URL', () => {
    const shortUrl = 'https://youtu.be/test789';

    render(<VideoPlayer videoUrl={shortUrl} />);

    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', expect.stringContaining('test789'));
  });
});
