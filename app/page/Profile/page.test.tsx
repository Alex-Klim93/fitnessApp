import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './page';

// Моки для API - полные моки
jest.mock('@/app/api/auth', () => ({
  isAuthenticated: jest.fn(() => true),
}));

jest.mock('@/app/api/userApi', () => ({
  useGetCurrentUserQuery: jest.fn(() => ({
    data: { user: { email: 'test@example.com' } },
    isLoading: false,
  })),
}));

// Мок для next/dynamic - исправленный
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () =>
    function DynamicComponent() {
      return React.createElement('div', {}, 'Dynamic Component');
    },
}));

// Мок для MyCourses компонента - исправленный
jest.mock('@/app/components/MyCourses/MyСourses', () => ({
  __esModule: true,
  default: () =>
    React.createElement(
      'div',
      { 'data-testid': 'my-courses-mock' },
      'Dynamic Component'
    ),
}));

// Моки для next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}));

// Моки для Redux
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(() => jest.fn()),
}));

// Мок для loadUserProfile
jest.mock('@/app/store/slices/authSlice', () => ({
  loadUserProfile: jest.fn(),
}));

describe('Profile Page', () => {
  const auth = require('@/app/api/auth');
  const userApi = require('@/app/api/userApi');

  const mockIsAuthenticated = auth.isAuthenticated as jest.Mock<boolean>;
  const mockUseGetCurrentUserQuery =
    userApi.useGetCurrentUserQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(true);
    mockUseGetCurrentUserQuery.mockReturnValue({
      data: { user: { email: 'test@example.com' } },
      isLoading: false,
    });
  });

  test('отображает профиль пользователя', async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Профиль')).toBeInTheDocument();
      expect(screen.getByText('Сергей')).toBeInTheDocument();
      expect(screen.getByText(/Логин:/i)).toBeInTheDocument();
      expect(screen.getByText('Выйти')).toBeInTheDocument();
      expect(screen.getByText('Мои курсы')).toBeInTheDocument();
      expect(screen.getByText('Dynamic Component')).toBeInTheDocument(); // Ищем именно этот текст
    });
  });

  test('перенаправляет на SignIn если пользователь не авторизован', async () => {
    mockIsAuthenticated.mockReturnValue(false);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/page/SignIn');
    });
  });

  test('отображает индикатор загрузки', () => {
    mockUseGetCurrentUserQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<ProfilePage />);

    expect(screen.getByText(/Загрузка профиля/i)).toBeInTheDocument();
  });

  test('отображает сообщение если пользователь не найден', async () => {
    mockUseGetCurrentUserQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/Пользователь не найден/i)).toBeInTheDocument();
    });
  });

  test('извлекает логин из email', async () => {
    mockUseGetCurrentUserQuery.mockReturnValue({
      data: { user: { email: 'john.doe@example.com' } },
      isLoading: false,
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/john.doe/i)).toBeInTheDocument();
    });
  });
});
