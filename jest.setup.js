import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Моки для fetch
global.fetch = jest.fn();

// Моки для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Моки для localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Моки для sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Моки для URL и URLSearchParams
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Моки для ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Моки для IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// TextEncoder/TextDecoder для Node.js
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Моки для next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// Исправленный мок для next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image({
    src,
    alt,
    width,
    height,
    priority,
    prefetch,
    ...props
  }) {
    // Удаляем свойства, которые не должны попадать в DOM
    const { priority: _, prefetch: __, ...restProps } = props;

    return React.createElement('img', {
      src,
      alt,
      width,
      height,
      loading: priority ? 'eager' : 'lazy',
      ...restProps,
      style: {
        ...restProps.style,
        maxWidth: '100%',
        height: 'auto',
      },
    });
  },
}));

// Моки для next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, prefetch, ...props }) => {
    // prefetch - это булево свойство, которое не должно передаваться в DOM
    const { prefetch: _, ...restProps } = props;

    if (typeof href === 'object') {
      // Если href - это объект, преобразуем его в строку для тестов
      const pathname = href.pathname || '';
      const search = href.query
        ? new URLSearchParams(href.query).toString()
        : '';
      const fullHref = search ? `${pathname}?${search}` : pathname;
      return React.createElement(
        'a',
        { href: fullHref, ...restProps },
        children
      );
    }

    return React.createElement('a', { href, ...restProps }, children);
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Моки для dynamic импортов - ИСПРАВЛЕНО: убрана типизация TypeScript
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    return function DynamicComponent(props) {
      return React.createElement('div', {}, 'Dynamic Component');
    };
  },
}));

// Моки для Redux
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));

// Моки для StoreProvider - ИСПРАВЛЕНО: убрана типизация TypeScript
jest.mock('@/app/store/StoreProvider', () => ({
  __esModule: true,
  default: ({ children }) => {
    return React.createElement('div', {}, children);
  },
}));

// Очистка моков перед каждым тестом
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  global.fetch.mockClear();
});

afterEach(() => {
  jest.restoreAllMocks();
});
