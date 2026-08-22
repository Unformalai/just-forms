<script lang="ts">
	let { form } = $props();
</script>

<svelte:head>
	<title>Admin</title>
</svelte:head>

<div class="wrap-narrow stack-lg">
	<div class="stack">
		<h1>Admin</h1>
		<p class="muted">Password is ADMIN_PASSWORD. Nothing else.</p>
	</div>

	<form method="POST" action="?/login" class="stack">
		<label class="field">
			<span>Password</span>
			<input type="password" name="password" autocomplete="current-password" required />
		</label>
		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
		<button type="submit">Log in</button>
	</form>
</div>
