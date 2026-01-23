// Мок для localStorage ДО импорта
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

// Мок для fetch API ДО импорта
global.fetch = jest.fn();

// Мок для auth модуля ДО импорта
jest.mock('@/app/api/auth', () => ({
  isAuthenticated: jest.fn(() => false),
}));

// ТОЛЬКО ПОСЛЕ моков импортируем функцию
import { getUserValidCourses } from './userCourseUtils';

describe('userCourseUtils', () => {
  const mockFetch = global.fetch as jest.Mock;
  const mockLocalStorageGetItem = jest.spyOn(window.localStorage, 'getItem');

  // Импортируем мок после его создания
  const auth = require('@/app/api/auth');
  const mockIsAuthenticated = auth.isAuthenticated as jest.Mock<boolean>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated.mockReturnValue(false);
    mockLocalStorageGetItem.mockReturnValue('test-token');
  });

  test('возвращает пустой массив для неавторизованных пользователей', async () => {
    mockIsAuthenticated.mockReturnValue(false);

    const result = await getUserValidCourses();

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('возвращает курсы пользователя', async () => {
    mockIsAuthenticated.mockReturnValue(true);

    const mockUserData = {
      user: {
        selectedCourses: ['course1', 'course2'],
      },
    };

    const mockAllCourses = [
      {
        _id: 'course1',
        nameRU: 'Курс 1',
        nameEN: 'Course 1',
        description: 'Описание 1',
        directions: ['Направление 1'],
        fitting: ['Для начинающих'],
        difficulty: 'Легкая',
        durationInDays: 30,
        dailyDurationInMinutes: { from: 20, to: 30 },
        workouts: ['workout1'],
      },
      {
        _id: 'course2',
        nameRU: 'Курс 2',
        nameEN: 'Course 2',
        description: 'Описание 2',
        directions: ['Направление 2'],
        fitting: ['Для продвинутых'],
        difficulty: 'Сложная',
        durationInDays: 45,
        dailyDurationInMinutes: { from: 30, to: 45 },
        workouts: ['workout2', 'workout3'],
      },
      {
        _id: 'course3',
        nameRU: 'Курс 3',
        nameEN: 'Course 3',
        description: 'Описание 3',
        directions: ['Направление 3'],
        fitting: ['Для среднего уровня'],
        difficulty: 'Средняя',
        durationInDays: 25,
        dailyDurationInMinutes: { from: 15, to: 25 },
        workouts: ['workout4'],
      },
    ];

    // Мокаем последовательные вызовы fetch
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAllCourses,
      });

    const result = await getUserValidCourses();

    expect(result).toHaveLength(2);
    expect(result[0]._id).toBe('course1');
    expect(result[1]._id).toBe('course2');
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Проверяем первый вызов fetch (получение данных пользователя)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://wedev-api.sky.pro/api/fitness/users/me',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
        },
      })
    );

    // Проверяем второй вызов fetch (получение всех курсов)
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://wedev-api.sky.pro/api/fitness/courses'
    );
  });

  test('обрабатывает ошибки при загрузке курсов', async () => {
    mockIsAuthenticated.mockReturnValue(true);

    const mockUserData = {
      user: {
        selectedCourses: ['course1', 'course2'],
      },
    };

    // Мокаем: первый запрос успешен, второй падает с ошибкой
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    const result = await getUserValidCourses();

    expect(result).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('обрабатывает отсутствие selectedCourses', async () => {
    mockIsAuthenticated.mockReturnValue(true);

    const mockUserData = {
      user: {
        selectedCourses: null,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    const result = await getUserValidCourses();

    expect(result).toEqual([]);
    // Только один запрос, потому что если нет selectedCourses, второй запрос не делается
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('обрабатывает пустой массив selectedCourses', async () => {
    mockIsAuthenticated.mockReturnValue(true);

    const mockUserData = {
      user: {
        selectedCourses: [],
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUserData,
    });

    const result = await getUserValidCourses();

    expect(result).toEqual([]);
    // Если selectedCourses пустой массив, второй запрос все равно делается
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('обрабатывает ошибку при получении данных пользователя', async () => {
    mockIsAuthenticated.mockReturnValue(true);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const result = await getUserValidCourses();

    expect(result).toEqual([]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
