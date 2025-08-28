import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Github, Users, Code, Smartphone } from 'lucide-react';

export default function AboutPage() {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold">Về ACTVN Schedule</h1>
				<p className="text-muted-foreground">
					Ứng dụng xem thời khóa biểu dành cho sinh viên Học viện Kỹ thuật Mật mã
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				{/* About Project */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Code className="h-5 w-5" />
							Về dự án
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<p className="text-sm text-muted-foreground">
							ACTVN Schedule là một ứng dụng web hiện đại được xây dựng để giúp sinh viên Học viện
							Kỹ thuật Mật mã xem thời khóa biểu một cách dễ dàng và tiện lợi.
						</p>

						<div className="flex flex-wrap gap-2">
							<Badge variant="secondary">Next.js</Badge>
							<Badge variant="secondary">TypeScript</Badge>
							<Badge variant="secondary">Tailwind CSS</Badge>
							<Badge variant="secondary">shadcn/ui</Badge>
						</div>
					</CardContent>
				</Card>

				{/* Team */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Đội ngũ phát triển
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
									<Code className="h-5 w-5" />
								</div>
								<div>
									<p className="font-medium">ngosangns</p>
									<p className="text-sm text-muted-foreground">Developer</p>
								</div>
							</div>
						</div>

						<Separator />

						<div className="space-y-2">
							<h4 className="font-medium">Liên hệ:</h4>
							<div className="space-y-2">
								<a
									href="https://github.com/ngosangns"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									<Github className="h-4 w-4" />
									GitHub
									<ExternalLink className="h-3 w-3" />
								</a>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Related Projects */}
				<Card className="md:col-span-2">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Smartphone className="h-5 w-5" />
							Các dự án liên quan
						</CardTitle>
						<CardDescription>
							Những ứng dụng khác mà chúng tôi đã phát triển cho sinh viên KMA
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="p-4 border rounded-lg">
								<div className="flex items-start justify-between mb-2">
									<h4 className="font-medium">KIT Schedule</h4>
									<Badge variant="outline">Mobile App</Badge>
								</div>
								<p className="text-sm text-muted-foreground mb-3">
									Ứng dụng xem lịch học trên điện thoại dành cho sinh viên học viện KMA.
								</p>
								<a
									href="https://play.google.com/store/apps/details?id=kma.hatuan314.schedule"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
								>
									Xem trên Google Play
									<ExternalLink className="h-3 w-3" />
								</a>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
