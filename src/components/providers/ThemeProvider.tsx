'use client';

import { useEffect } from 'react';
import { useUI } from '@/contexts/AppContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const { theme } = useUI();

	useEffect(() => {
		const root = window.document.documentElement;

		// Remove existing theme classes
		root.classList.remove('light', 'dark');

		// Add current theme class
		root.classList.add(theme);
	}, [theme]);

	return <>{children}</>;
}
