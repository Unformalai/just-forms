<script lang="ts">
	let { data, children } = $props();

	const links = [
		{ href: '/admin/forms', label: 'Forms' },
		{ href: '/admin/submissions', label: 'Submissions' },
		{ href: '/admin/settings', label: 'Settings' }
	];

	function current(href: string) {
		return data.path === href || data.path.startsWith(href + '/') ? 'page' : undefined;
	}
</script>

<div class="wrap">
	<nav class="nav">
		<a class="site-mark" href="/">Just Forms</a>
		{#if !data.path.startsWith('/admin/login')}
			<div class="nav-links">
				{#each links as link}
					<a href={link.href} aria-current={current(link.href)}>{link.label}</a>
				{/each}
				<form method="POST" action="/admin/login?/logout">
					<button class="linkish" type="submit">Log out</button>
				</form>
			</div>
		{/if}
	</nav>

	<div class="page">
		{#if data.usingDefaultPassword && !data.path.startsWith('/admin/login')}
			<p class="banner">ADMIN_PASSWORD is still the example value. Change it before you share this.</p>
		{/if}
		{@render children()}
	</div>
</div>
