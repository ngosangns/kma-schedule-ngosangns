'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageLoader } from '@/components/ui/loading-spinner';

export default function HomePage() {
	const router = useRouter();

	useEffect(() => {
		// Always redirect to calendar - it will handle authentication
		router.push('/calendar');
	}, [router]);

	return <PageLoader text="Đang chuyển hướng..." />;
}
