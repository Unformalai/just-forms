<script lang="ts">
	import { answersAsText, formatWhen } from '$lib/format';

	let { data } = $props();
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(answersAsText(data.answers));
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<svelte:head>
	<title>{data.submission.name || 'Submission'}</title>
</svelte:head>

<div class="stack-lg">
	<div class="stack">
		<p class="muted"><a href="/admin/submissions">Submissions</a> / {data.submission.form_title}</p>
		<h1>{data.submission.name || 'Untitled'}</h1>
		<p class="muted">
			{data.submission.email || 'No email'}
			· started {formatWhen(data.submission.started_at)}
			· {data.submission.status}
		</p>
	</div>

	<div class="row-actions">
		<button type="button" onclick={copy}>{copied ? 'Copied' : 'Copy answers'}</button>
		<a class="btn ghost" href="/admin/submissions/export.csv">Export CSV</a>
	</div>

	<dl class="answers">
		{#each data.answers as answer}
			<dt>{answer.label || answer.name}</dt>
			<dd>{answer.value || ''}</dd>
		{/each}
	</dl>
</div>
