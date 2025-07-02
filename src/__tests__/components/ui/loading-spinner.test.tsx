import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, PageLoader } from '@/components/ui/loading-spinner';

// Mock lucide-react
jest.mock('lucide-react', () => ({
	Loader2: ({ className, ...props }: any) => (
		<div data-testid="loader-icon" className={className} {...props} />
	)
}));

describe('LoadingSpinner', () => {
	it('should render with default props', () => {
		render(<LoadingSpinner />);

		const icon = screen.getByTestId('loader-icon');

		expect(icon).toHaveClass('animate-spin', 'h-6', 'w-6');
	});

	it('should render with text', () => {
		render(<LoadingSpinner text="Loading data..." />);

		const text = screen.getByText('Loading data...');
		expect(text).toBeInTheDocument();
		expect(text).toHaveClass('text-sm', 'text-muted-foreground');
	});

	it('should not render text when not provided', () => {
		render(<LoadingSpinner />);

		const text = screen.queryByText(/loading/i);
		expect(text).not.toBeInTheDocument();
	});

	describe('sizes', () => {
		it('should apply small size classes', () => {
			render(<LoadingSpinner size="sm" />);

			const icon = screen.getByTestId('loader-icon');
			expect(icon).toHaveClass('h-4', 'w-4');
		});

		it('should apply medium size classes (default)', () => {
			render(<LoadingSpinner size="md" />);

			const icon = screen.getByTestId('loader-icon');
			expect(icon).toHaveClass('h-6', 'w-6');
		});

		it('should apply large size classes', () => {
			render(<LoadingSpinner size="lg" />);

			const icon = screen.getByTestId('loader-icon');
			expect(icon).toHaveClass('h-8', 'w-8');
		});

		it('should default to medium size when size not specified', () => {
			render(<LoadingSpinner />);

			const icon = screen.getByTestId('loader-icon');
			expect(icon).toHaveClass('h-6', 'w-6');
		});
	});

	it('should merge custom className with default classes', () => {
		render(<LoadingSpinner className="custom-class" />);

		const icon = screen.getByTestId('loader-icon');
		expect(icon).toHaveClass('custom-class');
		expect(icon).toHaveClass('animate-spin', 'h-6', 'w-6');
	});

	it('should render with both size and text', () => {
		render(<LoadingSpinner size="lg" text="Please wait..." />);

		const icon = screen.getByTestId('loader-icon');
		const text = screen.getByText('Please wait...');

		expect(icon).toHaveClass('h-8', 'w-8');
		expect(text).toBeInTheDocument();
	});

	it('should have correct structure', () => {
		render(<LoadingSpinner text="Loading..." />);

		const icon = screen.getByTestId('loader-icon');
		const text = screen.getByText('Loading...');

		expect(icon).toBeInTheDocument();
		expect(text).toBeInTheDocument();
	});

	it('should apply animation class', () => {
		render(<LoadingSpinner />);

		const icon = screen.getByTestId('loader-icon');
		expect(icon).toHaveClass('animate-spin');
	});
});

describe('PageLoader', () => {
	it('should render with default text', () => {
		render(<PageLoader />);

		const text = screen.getByText('Đang tải...');
		expect(text).toBeInTheDocument();
	});

	it('should render with custom text', () => {
		render(<PageLoader text="Loading page..." />);

		const text = screen.getByText('Loading page...');
		expect(text).toBeInTheDocument();

		const defaultText = screen.queryByText('Đang tải...');
		expect(defaultText).not.toBeInTheDocument();
	});

	it('should have correct container styling', () => {
		render(<PageLoader />);

		// Check for the presence of the min-h class in the DOM
		const container = document.querySelector('.min-h-\\[400px\\]');
		expect(container).toBeInTheDocument();
		expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-[400px]');
	});

	it('should use large size spinner', () => {
		render(<PageLoader />);

		const icon = screen.getByTestId('loader-icon');
		expect(icon).toHaveClass('h-8', 'w-8');
	});

	it('should contain LoadingSpinner component', () => {
		render(<PageLoader text="Custom loading..." />);

		const icon = screen.getByTestId('loader-icon');
		const text = screen.getByText('Custom loading...');

		expect(icon).toBeInTheDocument();
		expect(text).toBeInTheDocument();
		expect(icon).toHaveClass('animate-spin');
	});

	it('should center content properly', () => {
		render(<PageLoader />);

		// Check for the presence of centering classes
		const outerContainer = document.querySelector('.min-h-\\[400px\\]');
		expect(outerContainer).toHaveClass('flex', 'items-center', 'justify-center');

		// Check for inner spinner container
		const spinnerContainer = document.querySelector('.gap-2');
		expect(spinnerContainer).toHaveClass('flex', 'items-center', 'justify-center', 'gap-2');
	});

	describe('accessibility', () => {
		it('should be accessible with screen readers', () => {
			render(<PageLoader text="Loading content..." />);

			const text = screen.getByText('Loading content...');
			expect(text).toBeInTheDocument();

			// The text provides context for screen readers
			expect(text).toHaveTextContent('Loading content...');
		});

		it('should have proper semantic structure', () => {
			render(<PageLoader />);

			// Should contain both icon and text for better accessibility
			const icon = screen.getByTestId('loader-icon');
			const text = screen.getByText('Đang tải...');

			expect(icon).toBeInTheDocument();
			expect(text).toBeInTheDocument();
		});
	});

	describe('integration with LoadingSpinner', () => {
		it('should pass correct props to LoadingSpinner', () => {
			render(<PageLoader text="Integration test" />);

			// Should use large size
			const icon = screen.getByTestId('loader-icon');
			expect(icon).toHaveClass('h-8', 'w-8');

			// Should display custom text
			const text = screen.getByText('Integration test');
			expect(text).toBeInTheDocument();
		});
	});
});
