'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	className?: string;
}

export function BottomSheet({ isOpen, onClose, children, title, className }: BottomSheetProps) {
	const [isVisible, setIsVisible] = React.useState(false);

	React.useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			document.body.style.overflow = 'hidden';
		} else {
			const timer = setTimeout(() => setIsVisible(false), 300);
			document.body.style.overflow = 'unset';
			return () => clearTimeout(timer);
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isVisible) return null;

	return (
		<div className="fixed inset-0 z-50 md:hidden">
			{/* Backdrop */}
			<div
				className={cn(
					'absolute inset-0 bg-black/50 transition-opacity duration-300',
					isOpen ? 'opacity-100' : 'opacity-0'
				)}
				onClick={onClose}
			/>

			{/* Bottom Sheet */}
			<div
				className={cn(
					'absolute bottom-0 left-0 right-0 bg-background rounded-t-xl border-t shadow-lg transition-transform duration-300 ease-out',
					isOpen ? 'translate-y-0' : 'translate-y-full',
					className
				)}
			>
				{/* Handle */}
				<div className="flex justify-center pt-3 pb-2">
					<div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
				</div>

				{/* Header */}
				{title && (
					<div className="flex items-center justify-between px-4 pb-4 border-b">
						<h3 className="text-lg font-semibold">{title}</h3>
						<Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Content */}
				<div className="max-h-[80vh] overflow-y-auto safe-bottom">{children}</div>
			</div>
		</div>
	);
}

interface BottomSheetTriggerProps {
	children: React.ReactNode;
	onClick: () => void;
	className?: string;
}

export function BottomSheetTrigger({ children, onClick, className }: BottomSheetTriggerProps) {
	return (
		<div onClick={onClick} className={cn('cursor-pointer', className)}>
			{children}
		</div>
	);
}

interface BottomSheetContentProps {
	children: React.ReactNode;
	className?: string;
}

export function BottomSheetContent({ children, className }: BottomSheetContentProps) {
	return <div className={cn('p-4', className)}>{children}</div>;
}
