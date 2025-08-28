import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div className={`flex items-center justify-center p-8 ${className}`}>
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					{Icon && (
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<Icon className="h-6 w-6 text-muted-foreground" />
						</div>
					)}
					<CardTitle className="text-lg">{title}</CardTitle>
					{description && <CardDescription className="text-sm">{description}</CardDescription>}
				</CardHeader>
				{action && (
					<CardContent>
						<Button onClick={action.onClick} className="w-full">
							{action.label}
						</Button>
					</CardContent>
				)}
			</Card>
		</div>
	);
}
