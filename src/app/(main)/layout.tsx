import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />

			<main
				className="flex-1 container mx-auto px-4 py-6 max-w-7xl"
				tabIndex={-1}
				role="main"
				aria-label="Main content"
			>
				{children}
			</main>

			<Footer />
		</div>
	);
}
