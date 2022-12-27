<script lang="ts">
	import Header from './Header.svelte';
	import './styles.css';
	import '../app.css';
</script>

<svelte:head>
	<title>KMA Schedule</title>
	<meta name="description" content="KMA Schedule" />
</svelte:head>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>

	<footer class="text-center">
		<span>KMA Schedule v2022.12 - ngosangns</span>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 72rem;
		min-width: 60rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
		width: 100%;
		min-width: 60rem;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
