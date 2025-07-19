'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/contexts/AppContext';

export function ThemeToggle() {
	const { theme, setTheme } = useUI();

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
			className="h-9 w-9 p-0"
			aria-label={`Chuyển sang ${theme === 'light' ? 'dark' : 'light'} mode`}
		>
			{theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
		</Button>
	);
}
