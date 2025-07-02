import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
	title: 'KMA Schedule',
	description: 'KMA Schedule - View your class schedule'
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
