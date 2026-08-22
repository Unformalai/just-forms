<script lang="ts">
	import { formatWhen } from '$lib/format';
	let { data } = $props();
</script>

<svelte:head>
	<title>Submissions</title>
</svelte:head>

<div class="stack-lg">
	<div class="stack">
		<div class="row-actions" style="justify-content: space-between;">
			<h1>Submissions</h1>
			<a class="btn ghost" href="/admin/submissions/export.csv">Export CSV</a>
		</div>
		<p class="muted">{data.submissions.length} in total.</p>
	</div>

	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Email</th>
					<th>Started</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each data.submissions as row}
					<tr class="clickable" onclick={() => (window.location.href = `/admin/submissions/${row.id}`)}>
						<td>{row.name || ''}</td>
						<td>{row.email || ''}</td>
						<td class="muted">{formatWhen(row.started_at)}</td>
						<td>{row.status}</td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="muted">Nothing yet. Open /f/intake and send one.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
