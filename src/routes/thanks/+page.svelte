<script lang="ts">
	import { page } from '$app/state';
	const slug = $derived(page.url.searchParams.get('form') ?? 'intake');
</script>

<svelte:head>
	<title>Thanks</title>
</svelte:head>

<div class="page">
	<div class="wrap-narrow stack-lg">
		<div class="stack">
			<p class="muted">Just Forms</p>
			<h1>Got it.</h1>
			<p class="muted">Thanks for sending that. You can close this page.</p>
		</div>
		<a href="/f/{slug}">Send another</a>
	</div>
</div>
