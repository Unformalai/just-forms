<script lang="ts">
	let { data, form } = $props();
	const webhookUrl = $derived(form?.webhookUrl ?? data.webhookUrl);
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="stack-lg">
	<div class="stack">
		<h1>Settings</h1>
		<p class="muted">Optional webhook. If set, each submit POSTs JSON to this URL. Failures are ignored.</p>
	</div>

	<form method="POST" class="stack">
		<label class="field">
			<span>Webhook URL</span>
			<input type="url" name="webhook_url" value={webhookUrl} placeholder="https://example.com/hooks/just-forms" />
		</label>
		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}
		{#if form?.saved}
			<p class="muted">Saved.</p>
		{/if}
		<button type="submit">Save</button>
	</form>
</div>
