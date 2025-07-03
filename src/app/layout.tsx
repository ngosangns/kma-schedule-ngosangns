import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
	title: 'KMA Schedule',
	description: 'KMA Schedule - View your class schedule',
	viewport: {
		width: 'device-width',
		initialScale: 1,
		maximumScale: 1,
		userScalable: false,
		viewportFit: 'cover'
	},
	themeColor: [
		{ media: '(prefers-color-scheme: light)', color: 'white' },
		{ media: '(prefers-color-scheme: dark)', color: '#0f172a' }
	],
	appleWebApp: {
		capable: true,
		statusBarStyle: 'default',
		title: 'KMA Schedule'
	}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" className="dark">
			<body>
				<AppProvider>
					<AppLayout>{children}</AppLayout>
				</AppProvider>
			</body>
		</html>
	);
}
