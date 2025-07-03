import { useToast } from '@/hooks/use-toast';
import { UseNotificationsReturn } from '@/types';

export function useNotifications(): UseNotificationsReturn {
	const { toast } = useToast();

	const showSuccess = (message: string, description?: string) => {
		toast({
			title: message,
			description,
			variant: 'default'
		});
	};

	const showError = (message: string, description?: string) => {
		toast({
			title: message,
			description,
			variant: 'destructive'
		});
	};

	const showWarning = (message: string, description?: string) => {
		toast({
			title: message,
			description,
			variant: 'default'
		});
	};

	const showInfo = (message: string, description?: string) => {
		toast({
			title: message,
			description,
			variant: 'default'
		});
	};

	return {
		showSuccess,
		showError,
		showWarning,
		showInfo
	};
}
