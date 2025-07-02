'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AppContext';
import { PageLoader } from '@/components/ui/loading-spinner';

export default function HomePage() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading) {
			if (isAuthenticated) {
				router.push('/calendar');
			} else {
				router.push('/login');
			}
		}
	}, [isAuthenticated, isLoading, router]);

	return <PageLoader text="Đang kiểm tra đăng nhập..." />;
}
