import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input', () => {
	it('should render with default props', () => {
		render(<Input />);

		const input = screen.getByRole('textbox');
		expect(input).toBeInTheDocument();
		expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md');
	});

	it('should render with placeholder', () => {
		render(<Input placeholder="Enter text here" />);

		const input = screen.getByPlaceholderText('Enter text here');
		expect(input).toBeInTheDocument();
	});

	it('should handle text input', async () => {
		const user = userEvent.setup();

		render(<Input />);

		const input = screen.getByRole('textbox');
		await user.type(input, 'Hello World');

		expect(input).toHaveValue('Hello World');
	});

	it('should handle onChange events', async () => {
		const handleChange = jest.fn();
		const user = userEvent.setup();

		render(<Input onChange={handleChange} />);

		const input = screen.getByRole('textbox');
		await user.type(input, 'test');

		expect(handleChange).toHaveBeenCalledTimes(4); // One for each character
	});

	it('should be disabled when disabled prop is true', () => {
		render(<Input disabled />);

		const input = screen.getByRole('textbox');
		expect(input).toBeDisabled();
		expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
	});

	it('should not accept input when disabled', async () => {
		const user = userEvent.setup();

		render(<Input disabled />);

		const input = screen.getByRole('textbox');
		await user.type(input, 'test');

		expect(input).toHaveValue('');
	});

	it('should handle different input types', () => {
		const { rerender, container } = render(<Input type="email" />);

		let input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('type', 'email');

		rerender(<Input type="password" />);
		input = container.querySelector('input[type="password"]') as HTMLInputElement;
		expect(input).toHaveAttribute('type', 'password');

		rerender(<Input type="number" />);
		input = screen.getByRole('spinbutton');
		expect(input).toHaveAttribute('type', 'number');
	});

	it('should merge custom className with default classes', () => {
		render(<Input className="custom-class" />);

		const input = screen.getByRole('textbox');
		expect(input).toHaveClass('custom-class');
		expect(input).toHaveClass('flex', 'h-10', 'w-full');
	});

	it('should forward ref correctly', () => {
		const ref = React.createRef<HTMLInputElement>();

		render(<Input ref={ref} />);

		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});

	it('should pass through HTML input attributes', () => {
		render(
			<Input
				name="test-input"
				id="test-id"
				value="test-value"
				readOnly
				data-testid="custom-input"
			/>
		);

		const input = screen.getByTestId('custom-input');
		expect(input).toHaveAttribute('name', 'test-input');
		expect(input).toHaveAttribute('id', 'test-id');
		expect(input).toHaveValue('test-value');
		expect(input).toHaveAttribute('readonly');
	});

	it('should handle focus and blur events', async () => {
		const handleFocus = jest.fn();
		const handleBlur = jest.fn();
		const user = userEvent.setup();

		render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

		const input = screen.getByRole('textbox');

		await user.click(input);
		expect(handleFocus).toHaveBeenCalledTimes(1);

		await user.tab();
		expect(handleBlur).toHaveBeenCalledTimes(1);
	});

	it('should handle keyboard events', () => {
		const handleKeyDown = jest.fn();
		const handleKeyUp = jest.fn();

		render(<Input onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />);

		const input = screen.getByRole('textbox');

		fireEvent.keyDown(input, { key: 'Enter' });
		fireEvent.keyUp(input, { key: 'Enter' });

		expect(handleKeyDown).toHaveBeenCalledTimes(1);
		expect(handleKeyUp).toHaveBeenCalledTimes(1);
	});

	it('should support controlled input', async () => {
		const ControlledInput = () => {
			const [value, setValue] = React.useState('');

			return (
				<Input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					data-testid="controlled-input"
				/>
			);
		};

		const user = userEvent.setup();
		render(<ControlledInput />);

		const input = screen.getByTestId('controlled-input');
		await user.type(input, 'controlled');

		expect(input).toHaveValue('controlled');
	});

	it('should support uncontrolled input with defaultValue', () => {
		render(<Input defaultValue="default text" />);

		const input = screen.getByRole('textbox');
		expect(input).toHaveValue('default text');
	});

	it('should have correct accessibility attributes', () => {
		render(<Input aria-label="Search input" aria-describedby="search-help" aria-required />);

		const input = screen.getByRole('textbox', { name: 'Search input' });
		expect(input).toHaveAttribute('aria-label', 'Search input');
		expect(input).toHaveAttribute('aria-describedby', 'search-help');
		expect(input).toHaveAttribute('aria-required', 'true');
	});

	it('should support form validation attributes', () => {
		render(<Input required minLength={3} maxLength={10} pattern="[A-Za-z]+" />);

		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('required');
		expect(input).toHaveAttribute('minlength', '3');
		expect(input).toHaveAttribute('maxlength', '10');
		expect(input).toHaveAttribute('pattern', '[A-Za-z]+');
	});

	it('should handle file input type', () => {
		const { container } = render(<Input type="file" accept=".jpg,.png" />);

		const input = container.querySelector('input[type="file"]') as HTMLInputElement;
		expect(input).toHaveAttribute('type', 'file');
		expect(input).toHaveAttribute('accept', '.jpg,.png');
		expect(input).toHaveClass('file:border-0', 'file:bg-transparent');
	});

	it('should support autoComplete', () => {
		render(<Input autoComplete="email" />);

		const input = screen.getByRole('textbox');
		expect(input).toHaveAttribute('autocomplete', 'email');
	});

	it('should have correct display name', () => {
		expect(Input.displayName).toBe('Input');
	});

	describe('focus management', () => {
		it('should be focusable', async () => {
			const user = userEvent.setup();

			render(<Input />);

			const input = screen.getByRole('textbox');
			await user.tab();

			expect(input).toHaveFocus();
		});

		it('should show focus styles', async () => {
			const user = userEvent.setup();

			render(<Input />);

			const input = screen.getByRole('textbox');
			await user.click(input);

			expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
		});
	});

	describe('placeholder styling', () => {
		it('should apply placeholder styles', () => {
			render(<Input placeholder="Placeholder text" />);

			const input = screen.getByPlaceholderText('Placeholder text');
			expect(input).toHaveClass('placeholder:text-muted-foreground');
		});
	});
});
