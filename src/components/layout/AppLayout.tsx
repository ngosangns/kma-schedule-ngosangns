'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { SkipToContent } from '@/components/ui/skip-to-content';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
	children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Redirect logic
	useEffect(() => {
		if (!isLoading) {
			const isAuthPage = pathname === '/login';
			const isPublicPage = pathname === '/' || pathname === '/about' || pathname === '/changelogs';

			if (!isAuthenticated && !isAuthPage && !isPublicPage) {
				router.push('/login');
			} else if (isAuthenticated && isAuthPage) {
				router.push('/calendar');
			}
		}
	}, [isAuthenticated, isLoading, pathname, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<SkipToContent />
			<div className={cn('min-h-screen bg-background text-foreground', 'flex flex-col')}>
				{children}
				<Toaster />
			</div>
		</ErrorBoundary>
	);
}
