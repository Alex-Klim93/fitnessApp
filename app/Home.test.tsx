import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';

jest.mock('@/app/components/Header/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header Component</div>,
}));

jest.mock('@/app/components/Subtitle/Subtitle', () => ({
  __esModule: true,
  default: () => <div data-testid="subtitle">Subtitle Component</div>,
}));

jest.mock('@/app/components/MainTitle/MainTitle', () => ({
  __esModule: true,
  default: () => <div data-testid="main-title">MainTitle Component</div>,
}));

jest.mock('@/app/components/Сourses/Сourses', () => ({
  __esModule: true,
  default: () => <div data-testid="courses">Courses Component</div>,
}));

jest.mock('@/app/components/ButUp/ButUp', () => ({
  __esModule: true,
  default: () => <div data-testid="but-up">ButUp Component</div>,
}));

// Мок для console.log
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Home Page', () => {
  beforeEach(() => {
    // Сбрасываем моки localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('отображает все основные компоненты', () => {
    render(<Home />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('subtitle')).toBeInTheDocument();
    expect(screen.getByTestId('main-title')).toBeInTheDocument();
    expect(screen.getByTestId('courses')).toBeInTheDocument();
    expect(screen.getByTestId('but-up')).toBeInTheDocument();
  });

  test('проверяет авторизацию при загрузке', async () => {
    const mockGetItem = jest.fn();

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
      },
      writable: true,
    });

    // Настраиваем возвращаемые значения
    mockGetItem.mockReturnValueOnce('test-token');
    mockGetItem.mockReturnValueOnce('user@example.com');

    render(<Home />);

    // Ждем, пока useEffect выполнится
    await waitFor(() => {
      expect(mockGetItem).toHaveBeenCalledWith('auth_token');
      expect(mockGetItem).toHaveBeenCalledWith('user_email');
    });
  });
});
