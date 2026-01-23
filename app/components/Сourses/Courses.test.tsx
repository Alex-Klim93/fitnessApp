import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Сourses from './Сourses';
import { useGetAllCoursesQuery } from '@/app/api/coursesApi';

// Интерфейс для типизации
interface Course {
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

// Моки для API
jest.mock('@/app/api/coursesApi', () => ({
  useGetAllCoursesQuery: jest.fn(),
}));

describe('Courses Component', () => {
  const mockUseGetAllCoursesQuery = useGetAllCoursesQuery as jest.Mock<{
    data: Course[] | undefined;
    isLoading: boolean;
    error: { message: string } | null;
  }>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает скелетоны при загрузке', () => {
    mockUseGetAllCoursesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<Сourses />);

    expect(screen.getByText(/Загрузка курсов/i)).toBeInTheDocument();
  });

  test('отображает сообщение об ошибке', () => {
    mockUseGetAllCoursesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: 'Ошибка загрузки' },
    });

    render(<Сourses />);

    expect(screen.getByText(/Ошибка при загрузке курсов/i)).toBeInTheDocument();
  });

  test('отображает сообщение когда нет курсов', () => {
    mockUseGetAllCoursesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<Сourses />);

    expect(screen.getByText(/Курсы не найдены/i)).toBeInTheDocument();
  });

  test('отображает список курсов', async () => {
    const mockCourses: Course[] = [
      {
        _id: '1',
        nameRU: 'Йога для начинающих',
        nameEN: 'Yoga for Beginners',
        description: 'Описание курса',
        directions: ['Гибкость', 'Релаксация'],
        fitting: ['Для начинающих'],
        difficulty: 'Легкая',
        durationInDays: 30,
        dailyDurationInMinutes: { from: 20, to: 30 },
        workouts: ['workout1', 'workout2'],
      },
      {
        _id: '2',
        nameRU: 'Стретчинг',
        nameEN: 'Stretching',
        description: 'Описание курса 2',
        directions: ['Гибкость'],
        fitting: ['Для всех уровней'],
        difficulty: 'Средняя',
        durationInDays: 25,
        dailyDurationInMinutes: { from: 15, to: 25 },
        workouts: ['workout3'],
      },
    ];

    mockUseGetAllCoursesQuery.mockReturnValue({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    render(<Сourses />);

    await waitFor(() => {
      expect(screen.getByText('Йога для начинающих')).toBeInTheDocument();
      expect(screen.getByText('Стретчинг')).toBeInTheDocument();
      expect(screen.getByText('30 дней')).toBeInTheDocument();
      expect(screen.getByText('20-30 мин/день')).toBeInTheDocument();
    });
  });

  test('содержит ссылки на страницы курсов', async () => {
    const mockCourses: Course[] = [
      {
        _id: '1',
        nameRU: 'Йога для начинающих',
        nameEN: 'Yoga for Beginners',
        description: 'Описание курса',
        directions: ['Гибкость'],
        fitting: ['Для начинающих'],
        difficulty: 'Легкая',
        durationInDays: 30,
        dailyDurationInMinutes: { from: 20, to: 30 },
        workouts: ['workout1'],
      },
    ];

    mockUseGetAllCoursesQuery.mockReturnValue({
      data: mockCourses,
      isLoading: false,
      error: null,
    });

    render(<Сourses />);

    await waitFor(() => {
      const courseLink = screen.getByText('Йога для начинающих').closest('a');
      expect(courseLink).toHaveAttribute(
        'href',
        expect.stringContaining('/page/Course/1')
      );
    });
  });
});
