export default function ChangelogsPage() {
	return (
		<div className="max-w-2xl mx-auto py-8 space-y-6">
			<div>
				<p className="font-semibold mb-2">Version 2022.12 - 12/2022:</p>
				<ul className="list-disc ml-8 space-y-1">
					<li>Thêm lại tính năng chọn học kỳ để xem lịch học.</li>
					<li>Bỏ tính năng xem lịch từ file Excel.</li>
					<li>Nâng cấp giao diện sử dụng DaisyUI.</li>
					<li>Thêm tính năng hiển thị lịch học tuần hiện tại khi vào trang web.</li>
					<li>Bảo trì API.</li>
					<li>Tối ưu code xử lí.</li>
					<li>Converted from SvelteKit to React with shadcn/ui.</li>
				</ul>
			</div>

			<div>
				<p className="font-semibold mb-2">Version 10 - 12/2022:</p>
				<ul className="list-disc ml-8 space-y-1">
					<li>Bảo trì API.</li>
					<li>Cập nhật các package.</li>
				</ul>
			</div>

			<div>
				<p className="font-semibold mb-2">Version 9 - 01/2021:</p>
				<ul className="list-disc ml-8 space-y-1">
					<li>Bảo trì API.</li>
				</ul>
			</div>

			<div>
				<p className="font-semibold mb-2">Version 8 - 06/2020:</p>
				<ul className="list-disc ml-8 space-y-1">
					<li>Thêm tính năng xem lịch từ file Excel (cơ sở miền Nam).</li>
					<li>Thêm lại tính năng xem lịch bằng tài khoản học viện.</li>
					<li>Bỏ bố cục xem lịch theo kỳ học.</li>
					<li>Bỏ tính năng hiển thị bảng thông tin chi tiết các môn học.</li>
					<li>Bỏ tính năng chuyển đổi hiển thị tên môn/mã môn.</li>
					<li>Nâng cấp giao diện sử dụng Material Design và dark mode.</li>
				</ul>
			</div>

			<div>
				<p className="font-semibold mb-2">Version 6 - 01/2020:</p>
				<ul className="list-disc ml-8 space-y-1">
					<li>Thêm tính năng xem lịch bằng mã nguồn HTML.</li>
					<li>Bỏ tính năng xem lịch bằng tài khoản học viện.</li>
					<li>Bỏ tính năng chọn học kì để xem lịch.</li>
					<li>Thêm 2 bố cục xem lịch theo tuần.</li>
				</ul>
			</div>

			<div>
				<p className="font-semibold mb-2">Version 1 - 10/2019:</p>
				<ul className="list-disc ml-8 space-y-1">
					<li>Tính năng xem lịch bằng tài khoản học viện.</li>
					<li>Bố cục lịch học hiển thị toàn kỳ học theo bảng truyền thống.</li>
					<li>Tính năng hiển thị bảng thông tin chi tiết các môn học.</li>
					<li>Tính năng chuyển đổi hiển thị tên môn/mã môn.</li>
					<li>Tính năng chọn học kì để xem lịch.</li>
					<li>Tính năng xem lịch học dạng rút gọn.</li>
					<li>Tính năng tải lịch học.</li>
					<li>Tính năng chuyển đổi light/dark mode.</li>
				</ul>
			</div>
		</div>
	);
}
