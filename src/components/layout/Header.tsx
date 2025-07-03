'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUI } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const navigation = [
	{ name: 'Changelogs', href: '/changelogs' },
	{ name: 'About', href: '/about' }
];

const externalLinks = [
	{
		name: 'KIT Club',
		href: 'https://www.facebook.com/kitclubKMA'
	},
	{
		name: 'Issues',
		href: 'https://github.com/ngosangns/kma-schedule-ngosangns/issues'
	}
];

export default function Header() {
	const pathname = usePathname();
	const { sidebarOpen, toggleSidebar } = useUI();

	return (
		<header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center space-x-4">
						<Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
							ACTVN SCHEDULE
						</Link>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center space-x-6">
						{navigation.map((item) => (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									'text-sm font-medium transition-colors hover:text-primary',
									pathname === item.href ? 'text-primary' : 'text-muted-foreground'
								)}
							>
								{item.name}
							</Link>
						))}

						<div className="h-4 w-px bg-border" />

						{externalLinks.map((item) => (
							<a
								key={item.name}
								href={item.href}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
							>
								{item.name}
								<ExternalLink className="h-3 w-3" />
							</a>
						))}
					</nav>

					{/* Mobile menu button */}
					<Button variant="ghost" size="sm" className="md:hidden" onClick={toggleSidebar}>
						{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>

				{/* Mobile Navigation */}
				{sidebarOpen && (
					<div className="md:hidden border-t py-4">
						<nav className="flex flex-col space-y-3">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										'text-sm font-medium transition-colors hover:text-primary px-2 py-1',
										pathname === item.href ? 'text-primary' : 'text-muted-foreground'
									)}
									onClick={toggleSidebar}
								>
									{item.name}
								</Link>
							))}

							<div className="h-px bg-border my-2" />

							{externalLinks.map((item) => (
								<a
									key={item.name}
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 px-2 py-1"
									onClick={toggleSidebar}
								>
									{item.name}
									<ExternalLink className="h-3 w-3" />
								</a>
							))}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
