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
		<header className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
			<div className="container mx-auto px-3 sm:px-4">
				<div className="flex h-14 sm:h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center space-x-2 sm:space-x-4">
						<Link
							href="/"
							className="text-lg sm:text-xl font-bold hover:text-primary transition-colors truncate"
						>
							<span className="hidden xs:inline">ACTVN SCHEDULE</span>
							<span className="xs:hidden">ACTVN</span>
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
					<Button
						variant="ghost"
						size="sm"
						className="md:hidden h-10 w-10 p-0"
						onClick={toggleSidebar}
						aria-label={sidebarOpen ? 'Đóng menu' : 'Mở menu'}
					>
						{sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
					</Button>
				</div>

				{/* Mobile Navigation */}
				{sidebarOpen && (
					<div className="md:hidden border-t bg-background/95 backdrop-blur-md">
						<nav className="flex flex-col py-4 px-2">
							{navigation.map((item) => (
								<Link
									key={item.name}
									href={item.href}
									className={cn(
										'text-base font-medium transition-colors hover:text-primary px-4 py-3 rounded-lg',
										pathname === item.href
											? 'text-primary bg-primary/10'
											: 'text-muted-foreground hover:bg-muted/50'
									)}
									onClick={toggleSidebar}
								>
									{item.name}
								</Link>
							))}

							<div className="h-px bg-border my-3 mx-4" />

							{externalLinks.map((item) => (
								<a
									key={item.name}
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors inline-flex items-center gap-2 px-4 py-3 rounded-lg"
									onClick={toggleSidebar}
								>
									{item.name}
									<ExternalLink className="h-4 w-4" />
								</a>
							))}
						</nav>
					</div>
				)}
			</div>
		</header>
	);
}
