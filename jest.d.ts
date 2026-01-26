import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toHaveClass(className: string): R;
      toHaveStyle(css: string | Record<string, unknown>): R;
      toHaveValue(value: string | string[] | number): R;
      toBeRequired(): R;
    }
  }
}
