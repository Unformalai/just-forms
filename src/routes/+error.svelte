<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<div class="page">
	<div class="wrap-narrow stack">
		<p class="muted">Just Forms</p>
		<h1>{page.status}</h1>
		<p class="muted">{page.error?.message || 'Something broke.'}</p>
		<a href="/">Home</a>
	</div>
</div>
