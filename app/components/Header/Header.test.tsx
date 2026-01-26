import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';
import * as auth from '@/app/api/auth';

jest.mock('@/app/api/auth');

describe('Header Component', () => {
  const mockIsAuthenticated = auth.isAuthenticated as jest.Mock<boolean>;
  const mockGetUserEmail = auth.getUserEmail as jest.Mock<string | null>;
  const mockGetUserLogin = auth.getUserLogin as jest.Mock<string | null>;
  const mockLogout = auth.logout as jest.Mock<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(false);
    mockGetUserEmail.mockReturnValue('');
    mockGetUserLogin.mockReturnValue('');
  });

  test('вызывает logout при клике на кнопку выхода', async () => {
    mockIsAuthenticated.mockReturnValue(true);
    mockGetUserLogin.mockReturnValue('testuser');
    mockGetUserEmail.mockReturnValue('test@example.com');

    render(<Header />);

    // Находим кнопку профиля по тексту или data-testid
    const profileButton =
      screen.getByText('testuser') ||
      screen.getByRole('button', { name: /testuser/i });

    await act(async () => {
      fireEvent.click(profileButton);
    });

    // Ждем появления попапа
    await waitFor(() => {
      expect(screen.getByText(/выйти/i)).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Выйти');

    await act(async () => {
      fireEvent.click(logoutButton);
    });

    // Проверяем, что logout вызывался хотя бы один раз
    expect(mockLogout).toHaveBeenCalled();
  });

  test('обновляет состояние при событии authStateChanged', async () => {
    mockIsAuthenticated.mockReturnValue(false);

    render(<Header />);

    expect(screen.getByRole('button', { name: /войти/i })).toBeInTheDocument();

    mockIsAuthenticated.mockReturnValue(true);
    mockGetUserLogin.mockReturnValue('newuser');

    await act(async () => {
      window.dispatchEvent(new Event('authStateChanged'));
    });

    await waitFor(() => {
      expect(screen.getByText('newuser')).toBeInTheDocument();
    });
  });
});
