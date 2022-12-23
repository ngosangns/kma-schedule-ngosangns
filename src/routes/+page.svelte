<script>
	import { goto } from '$app/navigation';
	import { loadData } from '$lib/js/storage';
	import { logout } from '$lib/js/user';

	const { calendar } = loadData();

	if (calendar && calendar.data_subject.length) {
		goto('/calendar');
	} else {
		logout();
		goto('/login');
	}
</script>
