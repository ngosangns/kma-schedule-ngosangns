<script>
	import { goto } from '$app/navigation';
	import { loadData } from '$lib/ts/storage';
	import { logout } from '$lib/ts/user';

	const { calendar } = loadData();

	if (calendar && calendar.data_subject.length) {
		goto('/calendar');
	} else {
		logout();
		goto('/login');
	}
</script>
