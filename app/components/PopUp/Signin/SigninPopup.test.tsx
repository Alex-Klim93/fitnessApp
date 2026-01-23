import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import SigninPopup from './SigninPopup';
import * as auth from '@/app/api/auth';

jest.mock('@/app/api/auth');

describe('SigninPopup Component', () => {
  const mockLogin = auth.login as jest.Mock<Promise<void>>;
  const mockIsAuthenticated = auth.isAuthenticated as jest.Mock<boolean>;
  const mockOnClose = jest.fn<() => void>();
  const mockOnOpenSignup = jest.fn<() => void>();
  const mockOnLoginSuccess = jest.fn<() => void>();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(false);
  });

  test('отображает ошибки валидации при пустых полях', async () => {
    render(
      <SigninPopup
        isOpen={true}
        onClose={mockOnClose}
        onOpenSignup={mockOnOpenSignup}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    const submitButton = screen.getByRole('button', { name: /войти/i });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('успешно отправляет форму входа', async () => {
    mockLogin.mockResolvedValueOnce();

    render(
      <SigninPopup
        isOpen={true}
        onClose={mockOnClose}
        onOpenSignup={mockOnOpenSignup}
        onLoginSuccess={mockOnLoginSuccess}
      />
    );

    // Используем getByPlaceholderText для поиска полей
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: 'Войти' });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });
});
