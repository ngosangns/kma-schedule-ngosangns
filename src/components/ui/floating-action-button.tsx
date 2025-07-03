'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
	onClick: () => void;
	icon?: React.ReactNode;
	label?: string;
	position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	children?: React.ReactNode;
}

export function FloatingActionButton({
	onClick,
	icon = <Plus className="h-6 w-6" />,
	label,
	position = 'bottom-right',
	size = 'md',
	className,
	children
}: FloatingActionButtonProps) {
	const positionClasses = {
		'bottom-right': 'bottom-6 right-6',
		'bottom-left': 'bottom-6 left-6',
		'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
	};

	const sizeClasses = {
		sm: 'h-12 w-12',
		md: 'h-14 w-14',
		lg: 'h-16 w-16'
	};

	return (
		<Button
			onClick={onClick}
			className={cn(
				'fixed z-40 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation safe-bottom safe-right safe-left',
				positionClasses[position],
				sizeClasses[size],
				label && 'px-4 w-auto h-12 rounded-full',
				className
			)}
			size="icon"
		>
			{children || (
				<>
					{icon}
					{label && <span className="ml-2 font-medium">{label}</span>}
				</>
			)}
		</Button>
	);
}

interface FloatingActionMenuProps {
	isOpen: boolean;
	onToggle: () => void;
	children: React.ReactNode;
	position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
	className?: string;
}

export function FloatingActionMenu({
	isOpen,
	onToggle,
	children,
	position = 'bottom-right',
	className
}: FloatingActionMenuProps) {
	const positionClasses = {
		'bottom-right': 'bottom-6 right-6',
		'bottom-left': 'bottom-6 left-6',
		'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
	};

	return (
		<div className={cn('fixed z-40', positionClasses[position], className)}>
			{/* Menu Items */}
			<div
				className={cn(
					'flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ease-out',
					isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
				)}
			>
				{children}
			</div>

			{/* Main FAB */}
			<FloatingActionButton
				onClick={onToggle}
				icon={
					<Plus
						className={cn(
							'h-6 w-6 transition-transform duration-200',
							isOpen && 'rotate-45'
						)}
					/>
				}
				position={position}
				className="relative"
			/>

			{/* Backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/20 -z-10"
					onClick={onToggle}
				/>
			)}
		</div>
	);
}

interface FloatingActionMenuItemProps {
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	className?: string;
}

export function FloatingActionMenuItem({
	onClick,
	icon,
	label,
	className
}: FloatingActionMenuItemProps) {
	return (
		<div className="flex items-center gap-3">
			<span className="bg-background text-foreground px-3 py-2 rounded-lg shadow-md text-sm font-medium whitespace-nowrap">
				{label}
			</span>
			<Button
				onClick={onClick}
				size="icon"
				className={cn(
					'h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation',
					className
				)}
			>
				{icon}
			</Button>
		</div>
	);
}
