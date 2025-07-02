import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function Header() {
	return (
		<header className="mt-12 mb-4 text-center w-full min-w-[60rem]">
			<h1 className="text-3xl">
				<Link href="/">ACTVN SCHEDULE</Link>
			</h1>
			<p className="inline-flex gap-2 mt-2">
				<Link href="/changelogs" className="underline">
					CHANGELOGS
				</Link>{' '}
				|
				<Link href="/about" className="underline">
					ABOUT
				</Link>{' '}
				|
				<a
					href="https://www.facebook.com/kitclubKMA"
					target="_blank"
					rel="noreferrer"
					className="underline inline-flex items-center gap-1"
				>
					KIT CLUB
					<ExternalLink className="w-3 h-3 mb-1" />
				</a>
				|
				<a
					href="https://github.com/ngosangns/kma-schedule-ngosangns/issues"
					className="underline inline-flex items-center gap-1"
					target="_blank"
					rel="noreferrer"
				>
					ISSUES
					<ExternalLink className="w-3 h-3 mb-1" />
				</a>
			</p>
		</header>
	);
}
