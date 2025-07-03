import '@testing-library/jest-dom';

// Extend Jest matchers with testing-library/jest-dom
declare global {
	namespace jest {
		interface Matchers<R> {
			toBeInTheDocument(): R;
			toHaveClass(...classNames: string[]): R;
			toHaveTextContent(text: string | RegExp): R;
			toHaveValue(value: string | number | string[]): R;
			toBeDisabled(): R;
			toHaveAttribute(attr: string, value?: string): R;
			toHaveFocus(): R;
		}
	}
}
