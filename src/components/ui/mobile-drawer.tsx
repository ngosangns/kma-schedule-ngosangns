'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	side?: 'left' | 'right';
	className?: string;
}

export function MobileDrawer({
	isOpen,
	onClose,
	children,
	title,
	side = 'left',
	className
}: MobileDrawerProps) {
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

	const translateClass = {
		left: isOpen ? 'translate-x-0' : '-translate-x-full',
		right: isOpen ? 'translate-x-0' : 'translate-x-full'
	};

	const positionClass = {
		left: 'left-0',
		right: 'right-0'
	};

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

			{/* Drawer */}
			<div
				className={cn(
					'absolute top-0 bottom-0 w-80 max-w-[85vw] bg-background shadow-lg transition-transform duration-300 ease-out safe-left safe-right',
					positionClass[side],
					translateClass[side],
					className
				)}
			>
				{/* Header */}
				{title && (
					<div className="flex items-center justify-between p-4 border-b safe-top">
						<h3 className="text-lg font-semibold">{title}</h3>
						<Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
							<X className="h-4 w-4" />
						</Button>
					</div>
				)}

				{/* Content */}
				<div className="flex-1 overflow-y-auto safe-bottom">{children}</div>
			</div>
		</div>
	);
}

interface MobileDrawerTriggerProps {
	children: React.ReactNode;
	onClick: () => void;
	className?: string;
}

export function MobileDrawerTrigger({ children, onClick, className }: MobileDrawerTriggerProps) {
	return (
		<div onClick={onClick} className={cn('cursor-pointer', className)}>
			{children}
		</div>
	);
}

interface MobileDrawerContentProps {
	children: React.ReactNode;
	className?: string;
}

export function MobileDrawerContent({ children, className }: MobileDrawerContentProps) {
	return <div className={cn('p-4', className)}>{children}</div>;
}
