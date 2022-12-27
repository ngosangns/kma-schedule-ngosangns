<script lang="ts">
	import { saveData } from '$lib/ts/storage';
	import {
		fetchCalendarWithGet,
		processCalendar,
		processMainForm,
		processSemesters,
		processStudent,
		filterTrashInHtml
	} from '$lib/ts/calendar';
	import { login, logout } from '$lib/ts/user';
	import { goto } from '$app/navigation';

	let username = '',
		password = '',
		loading = false,
		errorMessage = '',
		userResponse = '',
		errorMessage2 = '';

	const handleSubmit = async () => {
		loading = true;
		errorMessage = '';
		try {
			const signInToken = await login(username, password),
				response = filterTrashInHtml(await fetchCalendarWithGet(signInToken)),
				calendar = await processCalendar(response),
				student = processStudent(response),
				mainForm = processMainForm(response),
				semesters = processSemesters(response);
			saveData({
				signInToken,
				mainForm,
				semesters,
				calendar,
				student
			});

			goto('/calendar');
		} catch (e) {
			errorMessage =
				'Có lỗi xảy ra khi lấy thông tin thời khóa biểu hoặc tài khoản/mật khẩu không đúng!';
			logout();
		} finally {
			loading = false;
		}
	};

	const handleSubmitUserResponse = async () => {
		errorMessage2 = '';
		try {
			const response = filterTrashInHtml(userResponse),
				calendar = await processCalendar(response),
				student = processStudent(response),
				mainForm = processMainForm(response),
				semesters = processSemesters(response);
			saveData({
				mainForm,
				semesters,
				calendar,
				student
			});

			goto('/calendar');
		} catch (e) {
			errorMessage2 = 'Có lỗi xảy ra khi lấy thông tin thời khóa biểu!';
			logout();
		}
	};
</script>

<section>
	<div class="grid grid-cols-2 gap-8">
		<div class="card w-100 bg-base-100">
			<div class="card-body">
				<h2 class="card-title text-lg">XEM THỜI KHÓA BIỂU TỪ TÀI KHOẢN TRƯỜNG</h2>
				<form class="mt-4" on:submit|preventDefault={handleSubmit}>
					<input
						bind:value={username}
						type="text"
						placeholder="Username"
						class="input input-md w-full input-bordered"
						required
						disabled={loading}
					/>
					<input
						bind:value={password}
						type="password"
						placeholder="Password"
						class="input input-md w-full input-bordered mt-3"
						required
						disabled={loading}
					/>

					<button type="submit" class="btn w-full mt-4" class:loading>Đăng nhập</button>

					{#if errorMessage && errorMessage.length}
						<div class="alert alert-error shadow-lg mt-4">
							<div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="stroke-current flex-shrink-0 h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/></svg
								>
								<span>{errorMessage}</span>
							</div>
						</div>
					{/if}
				</form>
			</div>
		</div>
		<div class="card w-100 bg-base-300 shadow-xl">
			<div class="card-body">
				<h2 class="card-title text-lg">XEM THỜI KHÓA BIỂU TỪ MÃ NGUỒN</h2>
				<p class="text-sm">
					Nhằm tăng tính bảo mật cho tài khoản của các bạn, web đã hỗ trợ thêm tính năng dịch thời
					khoá biểu từ mã nguồn HTML.
				</p>
				<p class="text-sm">Hướng dẫn:</p>
				<ul class="steps steps-vertical bg-base-100 rounded-lg px-2 py-2">
					<li class="step">
						<span class="text-left text-sm">
							Bạn vào trang quản lí của trường tại địa chỉ
							<i>
								<u>
									<a href="http://qldt.actvn.edu.vn" target="_blank" rel="noreferrer">
										http://qldt.actvn.edu.vn
									</a>
								</u>
							</i> và tiến hành đăng nhập.
						</span>
					</li>
					<li class="step text-sm">
						<span>Vào mục: <i><b>Đăng ký học</b></i> → <i><b>Xem kết quả ĐKH</b></i>.</span>
					</li>
					<li class="step">
						<span class="text-left text-sm">
							Chuột phải chọn <i><b>Xem mã nguồn (View page source)</b></i> và copy toàn bộ code.
						</span>
					</li>
					<li class="step text-sm">
						<span>Dán code đó vào ô bên dưới và bấm <b>Xem lịch học</b>.</span>
					</li>
				</ul>
				<form class="mt-4" on:submit|preventDefault={handleSubmitUserResponse}>
					<textarea
						rows="1"
						bind:value={userResponse}
						placeholder="Dán mã nguồn của trang xem lịch học tại đây..."
						class="textarea w-full input-bordered"
						required
						disabled={loading}
					/>
					<button type="submit" class="btn w-full bg-neural-focus mt-4" disabled={loading}>
						Xem lịch học
					</button>

					{#if errorMessage2 && errorMessage2.length}
						<div class="alert alert-error shadow-lg mt-4">
							<div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="stroke-current flex-shrink-0 h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									><path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/></svg
								>
								<span>{errorMessage2}</span>
							</div>
						</div>
					{/if}
				</form>
			</div>
		</div>
	</div>
</section>

<style>
</style>
