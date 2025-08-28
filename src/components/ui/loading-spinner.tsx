import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	text?: string;
}

const sizeClasses = {
	sm: 'h-4 w-4',
	md: 'h-6 w-6',
	lg: 'h-8 w-8'
};

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
	return (
		<div className="flex items-center justify-center gap-2">
			<Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
			{text && <span className="text-sm text-muted-foreground">{text}</span>}
		</div>
	);
}

export function PageLoader({ text = 'Đang tải...' }: { text?: string }) {
	return (
		<div className="flex items-center justify-center min-h-[400px]">
			<LoadingSpinner size="lg" text={text} />
		</div>
	);
}
