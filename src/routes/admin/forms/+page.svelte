<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Forms</title>
</svelte:head>

<div class="stack-lg">
	<div class="stack">
		<h1>Forms</h1>
		<p class="muted">v1 lists what is in D1. Edit rows in the forms and fields tables if you need another one.</p>
	</div>

	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Title</th>
					<th>Slug</th>
					<th>Submissions</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each data.forms as form}
					<tr>
						<td>{form.title}</td>
						<td class="muted">{form.slug}</td>
						<td>{form.submissions}</td>
						<td><a href="/f/{form.slug}">Open</a></td>
					</tr>
				{:else}
					<tr>
						<td colspan="4" class="muted">No forms. Apply schema.sql.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
