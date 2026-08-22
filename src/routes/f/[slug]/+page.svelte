<script lang="ts">
	let { data } = $props();

	const initial = $derived(
		Object.fromEntries(
			data.fields.map((field) => [
				field.name,
				field.type === 'hidden' && field.name === 'utm_source' ? data.utmSource : ''
			])
		)
	);

	let values = $state<Record<string, string>>({});
	let seeded = $state('');

	$effect(() => {
		const key = data.fields.map((f) => f.id).join(',') + '|' + data.utmSource;
		if (seeded !== key) {
			values = { ...initial };
			seeded = key;
		}
	});

	function visible(field: (typeof data.fields)[number]) {
		if (!field.showIf) return true;
		return values[field.showIf.field] === field.showIf.equals;
	}

	function labelFor(option: string) {
		if (option === 'search') return 'Search';
		if (option === 'friend') return 'Friend';
		if (option === 'other') return 'Other';
		return option;
	}
</script>

<svelte:head>
	<title>{data.form.title}</title>
</svelte:head>

<div class="page">
	<div class="wrap-narrow stack-lg">
		<div class="stack">
			<p class="muted">Just Forms</p>
			<h1>{data.form.title}</h1>
			{#if data.form.description}
				<p class="muted">{data.form.description}</p>
			{/if}
		</div>

		<form class="stack-lg" method="POST" action="/api/submit">
			<input type="hidden" name="form_slug" value={data.form.slug} />
			<input type="hidden" name="started_at" value={new Date().toISOString()} />

			{#each data.fields as field}
				{#if field.type === 'hidden'}
					<input type="hidden" name={field.name} value={values[field.name] ?? ''} />
				{:else if visible(field)}
					<label class="field">
						<span>{field.label}{field.required ? '' : ' (optional)'}</span>

						{#if field.type === 'textarea'}
							<textarea
								name={field.name}
								required={Boolean(field.required)}
								bind:value={values[field.name]}
							></textarea>
						{:else if field.type === 'choice'}
							<div class="choices">
								{#each field.options as option}
									<label class="choice">
										<input
											type="radio"
											name={field.name}
											value={option}
											required={Boolean(field.required)}
											bind:group={values[field.name]}
										/>
										<span>{labelFor(option)}</span>
									</label>
								{/each}
							</div>
						{:else}
							<input
								type={field.type === 'email' ? 'email' : 'text'}
								name={field.name}
								required={Boolean(field.required)}
								bind:value={values[field.name]}
								autocomplete={field.name === 'email' ? 'email' : field.name === 'name' ? 'name' : 'on'}
							/>
						{/if}
					</label>
				{/if}
			{/each}

			{#if data.turnstileSiteKey}
				<div class="cf-turnstile" data-sitekey={data.turnstileSiteKey} data-theme="light"></div>
			{/if}

			<button type="submit">Send</button>
		</form>
	</div>
</div>

{#if data.turnstileSiteKey}
	<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
{/if}
