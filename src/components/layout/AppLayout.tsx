'use client';

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
	// No authentication logic here anymore - each page handles its own auth requirements

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
