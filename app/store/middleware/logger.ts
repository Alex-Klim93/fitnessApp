// app/store/middleware/logger.ts
import { Middleware, UnknownAction } from "@reduxjs/toolkit";

// Глобальная переменная для отслеживания применения логгера
declare global {
  interface Window {
    __REDUX_LOGGER_APPLIED__?: boolean;
  }
}

// Безопасный тип для действия с полем type
interface ActionWithType {
  type: string;
  payload?: unknown;
}

// Функция для безопасной проверки типа action
function isActionWithType(action: unknown): action is ActionWithType {
  return (
    action !== null &&
    typeof action === "object" &&
    "type" in action &&
    typeof (action as { type: unknown }).type === "string"
  );
}

export const logger: Middleware = (store) => (next) => (action) => {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (!isDevelopment) {
    return next(action);
  }

  // Проверяем, не был ли логгер уже применен
  if (typeof window !== "undefined" && window.__REDUX_LOGGER_APPLIED__) {
    return next(action);
  }

  // Помечаем логгер как примененный
  if (typeof window !== "undefined") {
    window.__REDUX_LOGGER_APPLIED__ = true;
  }

  // Безопасно получаем тип action
  const actionType = isActionWithType(action) ? action.type : "UNKNOWN_ACTION";

  console.groupCollapsed(
    `%cRedux Action: ${actionType}`,
    "color: #764ba2; font-weight: bold",
  );

  console.log(
    "%cPrevious State:",
    "color: #9E9E9E; font-weight: bold",
    store.getState(),
  );
  console.log("%cAction:", "color: #03A9F4; font-weight: bold", action);

  const result = next(action);

  console.log(
    "%cNext State:",
    "color: #4CAF50; font-weight: bold",
    store.getState(),
  );
  console.groupEnd();

  return result;
};

// Альтернативная версия без глобальной переменной
export const safeLogger: Middleware = (store) => {
  // Проверяем инициализацию один раз
  let initialized = false;

  return (next) => (action) => {
    if (!initialized) {
      initialized = true;

      if (process.env.NODE_ENV === "development") {
        console.log(
          "%c🔧 Redux Logger initialized",
          "color: #4CAF50; font-weight: bold",
        );
      }
    }

    if (process.env.NODE_ENV !== "development") {
      return next(action);
    }

    // Безопасно получаем тип action
    const actionType = isActionWithType(action)
      ? action.type
      : "UNKNOWN_ACTION";

    console.groupCollapsed(
      `%c${actionType}`,
      "color: #673ab7; font-weight: bold",
    );

    // Безопасно получаем payload
    const payload = isActionWithType(action) ? action.payload : undefined;
    console.log("%cPayload:", "color: #2196f3;", payload);

    console.log("%cState before:", "color: #ff9800;", store.getState());

    const result = next(action);

    console.log("%cState after:", "color: #4caf50;", store.getState());
    console.groupEnd();

    return result;
  };
};
