'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	fullScreen?: boolean;
	className?: string;
}

export function MobileModal({
	isOpen,
	onClose,
	children,
	title,
	fullScreen = false,
	className
}: MobileModalProps) {
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
		<div className="fixed inset-0 z-50">
			{/* Backdrop */}
			<div
				className={cn(
					'absolute inset-0 bg-black/50 transition-opacity duration-300',
					isOpen ? 'opacity-100' : 'opacity-0'
				)}
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={cn(
					'absolute inset-0 flex items-center justify-center p-4',
					fullScreen && 'p-0'
				)}
			>
				<div
					className={cn(
						'relative bg-background rounded-lg shadow-lg transition-all duration-300 ease-out w-full max-w-md max-h-[90vh] overflow-hidden',
						fullScreen && 'max-w-none max-h-none h-full rounded-none safe-top safe-bottom safe-left safe-right',
						isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
						className
					)}
				>
					{/* Header */}
					{title && (
						<div className="flex items-center justify-between p-4 border-b">
							<h3 className="text-lg font-semibold">{title}</h3>
							<Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
								<X className="h-4 w-4" />
							</Button>
						</div>
					)}

					{/* Content */}
					<div className="flex-1 overflow-y-auto">{children}</div>
				</div>
			</div>
		</div>
	);
}

interface MobileModalTriggerProps {
	children: React.ReactNode;
	onClick: () => void;
	className?: string;
}

export function MobileModalTrigger({ children, onClick, className }: MobileModalTriggerProps) {
	return (
		<div onClick={onClick} className={cn('cursor-pointer', className)}>
			{children}
		</div>
	);
}

interface MobileModalContentProps {
	children: React.ReactNode;
	className?: string;
}

export function MobileModalContent({ children, className }: MobileModalContentProps) {
	return <div className={cn('p-4', className)}>{children}</div>;
}

interface MobileModalHeaderProps {
	children: React.ReactNode;
	className?: string;
}

export function MobileModalHeader({ children, className }: MobileModalHeaderProps) {
	return <div className={cn('p-4 border-b', className)}>{children}</div>;
}

interface MobileModalFooterProps {
	children: React.ReactNode;
	className?: string;
}

export function MobileModalFooter({ children, className }: MobileModalFooterProps) {
	return <div className={cn('p-4 border-t bg-muted/20', className)}>{children}</div>;
}
