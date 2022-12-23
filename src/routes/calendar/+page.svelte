<script>
	import { loadData, saveData } from '$lib/js/storage';
	import moment from 'moment';
	import {
		fetchCalendarWithPost,
		processCalendar,
		processMainForm,
		processSemesters,
		processStudent,
		filterTrashInHtml,
		exportToGoogleCalendar
	} from '$lib/js/calendar';
	import { logout } from '$lib/js/user';
	import { goto } from '$app/navigation';

	let { calendar, student, semesters, mainForm, signInToken } = loadData();
	let loading = false,
		errorMessage = '',
		shiftTimetable = [
			{ start: '07:00', end: '07:45' },
			{ start: '07:50', end: '08:35' },
			{ start: '08:40', end: '09:25' },
			{ start: '09:35', end: '10:20' },
			{ start: '10:25', end: '11:10' },
			{ start: '11:15', end: '12:00' },
			{ start: '12:30', end: '13:15' },
			{ start: '13:20', end: '14:05' },
			{ start: '14:10', end: '14:55' },
			{ start: '15:05', end: '15:50' },
			{ start: '15:55', end: '16:40' },
			{ start: '16:45', end: '17:30' },
			{ start: '18:00', end: '18:45' },
			{ start: '18:45', end: '19:30' },
			{ start: '19:45', end: '20:30' },
			{ start: '20:30', end: '21:15' }
		];

	// set current week index
	let currentWeekIndex = 0;
	const initialCurrentWeekIndex = () => {
		for (const [index, week] of (calendar?.data_subject || []).entries()) {
			if (
				moment(week[0].time).isSameOrBefore(moment()) &&
				moment(week[week.length - 1].time).isSameOrAfter(moment())
			) {
				currentWeekIndex = index;
				break;
			}
		}
	};
	initialCurrentWeekIndex();

	// set current week
	const onChangeWeekIndex = (/** @type {number} */ newWeekIndex) => {
		/** @type {any[][]} */
		const _data = calendar?.data_subject || [];
		if (!_data.length) {
			currentWeekIndex = 0;
			currentWeek = [];
			return;
		}

		currentWeekIndex = newWeekIndex;
		if (currentWeekIndex < 0) currentWeekIndex = 0;
		if (currentWeekIndex >= _data.length) currentWeekIndex = _data.length - 1;

		currentWeek = _data[currentWeekIndex];
	};
	/** @type {any[]} */
	let currentWeek = [];
	// initial currentWeek value
	onChangeWeekIndex(currentWeekIndex);

	async function onChangeSemester(/** @type {*} */ e) {
		errorMessage = '';
		loading = true;
		let oldValue = semesters.currentSemester;
		try {
			semesters.currentSemester = e.target.value;
			saveData({ semesters });

			const hidSemester = semesters.semesters.find((/** @type {*} */ v) =>
				v.value == semesters.currentSemester ? v : undefined
			);

			mainForm['drpSemester'] = semesters.currentSemester;
			mainForm['hidSemester'] = hidSemester.from + '_' + hidSemester.to + '_' + hidSemester.th;

			let response = await fetchCalendarWithPost(mainForm, signInToken);
			response = filterTrashInHtml(response);
			calendar = await processCalendar(response);
			student = processStudent(response);
			mainForm = processMainForm(response);
			semesters = processSemesters(response);

			currentWeekIndex = 0;
			initialCurrentWeekIndex();
			onChangeWeekIndex(currentWeekIndex);

			saveData({
				mainForm,
				semesters,
				calendar,
				student
			});
		} catch (_) {
			errorMessage = 'Có lỗi xảy ra khi lấy dữ liệu!';
			semesters.currentSemester = oldValue;
		} finally {
			loading = false;
		}
	}

	/**
	 * @param {number} shift
	 */
	const checkSession = (shift) => {
		if (shift >= 1 && shift <= 6) return 'morning';
		if (shift >= 7 && shift <= 12) return 'afternoon';
		return 'evening';
	};

	const logoutUser = () => {
		logout();
		goto('/login');
	};
</script>

<div class="navbar bg-neutral text-neutral-content rounded-lg">
	<div class="navbar-start">
		<h2 class="ml-4 text-md">{student}</h2>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1" />
	</div>
	<div class="navbar-end">
		<button class="btn mr-2" on:click={() => exportToGoogleCalendar(student, calendar)}>
			Xuất file Google Calendar
		</button>
		<button class="btn" on:click={logoutUser}>Đăng xuất</button>
	</div>
</div>

<div class="grid mt-4 gap-4" style="grid-template-columns: 1fr 10fr 1fr">
	<button
		class="btn h-full leading-normal"
		on:click={() => onChangeWeekIndex(--currentWeekIndex)}
		class:no-animation={currentWeek.length == 0 || currentWeekIndex == 0}
	>
		{#if currentWeek.length > 0}
			Tuần<br />trước
		{/if}
	</button>
	<div class="card bg-neutral text-neutral-content rounded-lg">
		<div class="card-body p-2">
			<div class="navbar bg-base-100 rounded-lg">
				<div class="flex-1">
					{#if signInToken && signInToken.length}
						<select
							value={semesters.currentSemester}
							on:change={onChangeSemester}
							class="select select-bordered max-w-max"
							disabled={loading}
						>
							{#each semesters.semesters as item}
								<option value={item.value}>{`${item.from} - ${item.to} - KỲ ${item.th}`}</option>
							{/each}
						</select>
					{/if}
				</div>
				<div class="flex-none">
					{#if currentWeek.length}
						<button
							class="btn btn-ghost no-animation cursor-default font-normal pointer-events-none"
							class:loading
						>
							Tuần {currentWeekIndex + 1}:
							{moment(currentWeek[0].time).format('DD/MM/YYYY')} -
							{moment(currentWeek[currentWeek.length - 1].time).format('DD/MM/YYYY')}
						</button>
					{/if}
				</div>
			</div>
			{#if errorMessage && errorMessage.length}
				<div class="alert alert-error rounded-lg">
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
			{#if !currentWeek.length}
				<div class="alert alert-info rounded-lg">
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="stroke-current flex-shrink-0 w-6 h-6"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
						<span>Lịch trống</span>
					</div>
				</div>
			{/if}
			{#if currentWeek.length}
				<div class="overflow-x-auto">
					<table class="table w-full table-fixed overflow-hidden">
						<thead>
							<tr>
								<th colspan="3" class="text-center">
									<div class="grid grid-cols-2 grid-rows-2">
										<span />
										<span>Tiết</span>
										<span>Thứ</span>
										<span />
									</div>
									<div
										class="relative border-base-content border-b w-full"
										style="transform: skewY(30deg) translateY(-1.1rem) translateX(.1rem) scaleX(.75)"
									/>
								</th>
								<th>1</th>
								<th>2</th>
								<th>3</th>
								<th>4</th>
								<th>5</th>
								<th>6</th>
								<th class="bg-neutral">7</th>
								<th class="bg-neutral">8</th>
								<th class="bg-neutral">9</th>
								<th class="bg-neutral">10</th>
								<th class="bg-neutral">11</th>
								<th class="bg-neutral">12</th>
								<th class="bg-neutral-focus">13</th>
								<th class="bg-neutral-focus">14</th>
								<th class="bg-neutral-focus">15</th>
								<th class="bg-neutral-focus">16</th>
							</tr>
						</thead>
						<tbody>
							{#each currentWeek as day}
								<tr>
									<td colspan="3" class="text-xs text-center">
										{moment(day.time).format('dddd[\n]DD/MM/YYYY').split('\n')[0]}<br />
										{moment(day.time).format('dddd[\n]DD/MM/YYYY').split('\n')[1]}
									</td>
									{#each day.shift as shift, shiftIndex}
										{#if parseInt(shift.length)}
											<td
												class="px-2"
												class:bg-neutral={checkSession(shiftIndex + 1) == 'afternoon'}
												class:bg-neutral-focus={checkSession(shiftIndex + 1) == 'evening'}
												colspan={shift.length}
											>
												{#if shift.content}
													<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
													<div
														class="dropdown w-full"
														class:dropdown-end={['afternoon', 'evening'].includes(
															checkSession(shiftIndex + 1)
														)}
														class:dropdown-top={[0, 6].includes(moment(day.time).day())}
													>
														<div
															tabindex="0"
															class="alert alert-info w-full shadow-lg text-xs p-2 rounded-lg cursor-pointer"
														>
															<span tabindex="0" class="block w-full truncate select-none">
																{shiftTimetable[shiftIndex].start}
																{shift.name}
															</span>
														</div>
														<div
															tabindex="0"
															class="dropdown-content menu p-2 text-neutral bg-success text-neural-focus rounded-lg"
														>
															<li class="text-xs">
																Môn: {shift.name}
															</li>
															<li class="text-xs">
																Thời gian: {shiftTimetable[shiftIndex].start} -
																{shiftTimetable[shiftIndex + shift.length - 1].end}
															</li>
															{#if shift.address && shift.address.length}
																<li class="text-xs">
																	Tại: {shift.address}
																</li>
															{/if}
														</div>
													</div>
												{/if}
											</td>
										{/if}
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>
	<button
		class="btn h-full leading-normal"
		on:click={() => onChangeWeekIndex(++currentWeekIndex)}
		class:no-animation={currentWeek.length == 0 ||
			currentWeekIndex >= (calendar?.data_subject || []).length - 1}
	>
		{#if currentWeek.length > 0}
			Tuần<br />sau
		{/if}
	</button>
</div>
