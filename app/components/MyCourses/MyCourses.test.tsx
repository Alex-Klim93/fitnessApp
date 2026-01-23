import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyСourses from './MyСourses';
import * as auth from '@/app/api/auth';
import { getUserValidCourses } from '@/app/utils/userCourseUtils';

jest.mock('@/app/api/auth');
jest.mock('@/app/utils/userCourseUtils');
jest.mock('@/app/api/userApi', () => ({
  useRemoveCourseFromUserMutation: () => [jest.fn()],
}));
jest.mock('@/app/api/coursesApi', () => ({
  useResetCourseProgressMutation: () => [jest.fn()],
  useGetCourseWorkoutsQuery: () => ({ data: [] }),
}));
jest.mock('@/app/api/progressApi', () => ({
  useGetUserProgressQuery: () => ({ data: null }),
}));

// Мок для console.log чтобы не мешал тестам
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('MyCourses Component', () => {
  const mockIsAuthenticated = auth.isAuthenticated as jest.Mock<boolean>;
  const mockGetUserValidCourses = getUserValidCourses as jest.Mock<
    Promise<any[]>
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает сообщение для неавторизованных пользователей', () => {
    mockIsAuthenticated.mockReturnValue(false);

    render(<MyСourses />);

    expect(
      screen.getByText(/Войдите, чтобы видеть свои курсы/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  test('отображает сообщение о загрузке', () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetUserValidCourses.mockReturnValue(new Promise(() => {}));

    render(<MyСourses />);

    expect(screen.getByText(/Загрузка курсов/i)).toBeInTheDocument();
  });

  test('отображает сообщение когда нет курсов', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetUserValidCourses.mockResolvedValue([]);

    render(<MyСourses />);

    await waitFor(() => {
      expect(
        screen.getByText(/У вас пока нет добавленных курсов/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Посмотреть все курсы/i)).toBeInTheDocument();
    });
  });

  test('отображает список курсов пользователя', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    const mockCourses = [
      {
        _id: '1',
        nameRU: 'Мой курс йоги',
        nameEN: 'My Yoga Course',
        description: 'Описание',
        directions: ['Гибкость'],
        fitting: ['Для всех'],
        difficulty: 'Легкая',
        durationInDays: 30,
        dailyDurationInMinutes: { from: 20, to: 30 },
        workouts: ['workout1'],
      },
    ];

    mockGetUserValidCourses.mockResolvedValue(mockCourses);

    render(<MyСourses />);

    await waitFor(() => {
      expect(screen.getByText('Мой курс йоги')).toBeInTheDocument();
      expect(screen.getByText('30 дней')).toBeInTheDocument();
      expect(screen.getByText('20-30 мин/день')).toBeInTheDocument();
    });
  });

  test('отображает прогресс курсов', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    const mockCourses = [
      {
        _id: '1',
        nameRU: 'Курс с прогрессом',
        nameEN: 'Course with Progress',
        description: 'Описание',
        directions: ['Гибкость'],
        fitting: ['Для всех'],
        difficulty: 'Средняя',
        durationInDays: 25,
        dailyDurationInMinutes: { from: 15, to: 25 },
        workouts: ['workout1', 'workout2'],
      },
    ];

    mockGetUserValidCourses.mockResolvedValue(mockCourses);

    render(<MyСourses />);

    await waitFor(() => {
      // Используем getAllByText так как может быть несколько элементов
      const progressElements = screen.getAllByText(/Прогресс/i);
      expect(progressElements.length).toBeGreaterThan(0);
    });
  });

  test('отображает кнопку для начала тренировки', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    const mockCourses = [
      {
        _id: '1',
        nameRU: 'Курс для тренировки',
        nameEN: 'Course for Training',
        description: 'Описание',
        directions: ['Сила'],
        fitting: ['Для начинающих'],
        difficulty: 'Легкая',
        durationInDays: 30,
        dailyDurationInMinutes: { from: 20, to: 30 },
        workouts: ['workout1'],
      },
    ];

    mockGetUserValidCourses.mockResolvedValue(mockCourses);

    render(<MyСourses />);

    await waitFor(() => {
      expect(screen.getByText('Начать тренировку')).toBeInTheDocument();
    });
  });
});
