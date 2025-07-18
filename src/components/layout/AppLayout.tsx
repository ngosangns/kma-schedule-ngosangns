'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AppContext';
import { CoursePlanningProvider } from '@/contexts/CoursePlanningContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
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
			<div className="min-h-screen flex items-center justify-center bg-background">
				<div className="flex flex-col items-center space-y-4">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary bg-transparent"></div>
					<p className="text-sm text-muted-foreground">Đang tải...</p>
				</div>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<ThemeProvider>
				<CoursePlanningProvider>
					<SkipToContent />
					<div className={cn('min-h-screen bg-background text-foreground', 'flex flex-col')}>
						{children}
						<Toaster />
					</div>
				</CoursePlanningProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
