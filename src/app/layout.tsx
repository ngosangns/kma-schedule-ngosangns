import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
	title: 'KMA Schedule',
	description: 'KMA Schedule - View your class schedule',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'KMA Schedule'
	}
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<AppProvider>
					<AppLayout>{children}</AppLayout>
				</AppProvider>
			</body>
		</html>
	);
}
