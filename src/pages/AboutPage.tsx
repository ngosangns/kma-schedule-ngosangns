import { ExternalLink } from 'lucide-react';

export default function AboutPage() {
	return (
		<div className="max-w-2xl mx-auto py-8 space-y-4">
			<p>
				Hello, mình là Sang. Đến từ Huế, sống tại TP HCM, có thời gian ở Hà Nội. <br />
				Hồi xưa đẹp trai lắm giờ đỡ nhiều rồi :) <br />
				Đây là web cá nhân của mình:{' '}
				<a
					href="https://ngosangns.com"
					target="_blank"
					rel="noreferrer"
					className="underline inline-flex items-center gap-1"
				>
					https://ngosangns.com
					<ExternalLink className="w-3 h-3" />
				</a>
			</p>

			<p>
				Trang web này là một dự án nằm trong chuỗi các dữ án hỗ trợ sinh viên của Câu lạc bộ lập
				trình Học viện Kỹ thuật Mật Mã hay còn được gọi là KIT (KMA IT).
			</p>

			<p>Một số dự án khác mà chúng mình đã thực hiện:</p>

			<ul className="list-disc ml-8 space-y-2">
				<li>
					<a
						href="https://play.google.com/store/apps/details?id=kma.hatuan314.schedule"
						target="_blank"
						rel="noreferrer"
						className="underline inline-flex items-center gap-1"
					>
						KIT Schedule
						<ExternalLink className="w-3 h-3" />
					</a>{' '}
					- Ứng dụng xem lịch học trên điện thoại dành cho sinh viên học viện KMA.
				</li>
				<li>
					<a
						href="https://github.com/ngosangns/tin-chi"
						target="_blank"
						rel="noreferrer"
						className="underline inline-flex items-center gap-1"
					>
						KMA Tín chỉ
						<ExternalLink className="w-3 h-3" />
					</a>{' '}
					- Tool hỗ trợ sinh viên sắp xếp lịch học hợp lí cho bản thân vào mỗi mùa đăng ký học.
				</li>
			</ul>
		</div>
	);
}
