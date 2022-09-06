<script lang='ts'>
	import { page } from '$app/stores';
	import { NavItem, NavLink } from 'sveltestrap';

	const docsBaseUrl = '/docs/';

	export let href: string | undefined = undefined;
	export let heading = false;

	export let matchActiveRegex: RegExp | undefined = undefined;
	export let matchActiveExact = href === '/';

	$: currentPath = $page.url.pathname.toLowerCase();
	$: active = matchActiveRegex ? matchActiveRegex!.test(currentPath) : matchActiveExact ? currentPath === href?.toLowerCase() : currentPath.startsWith(href?.toLowerCase());
</script>

<NavItem class=''>
	{#if href}
		<NavLink class='p-3 pb-0' href='{docsBaseUrl}{href}'>
			<slot />
		</NavLink>
	{:else if heading}
		<h5 class='p-3 pb-0 mb-0 fw-bold'>
			<slot />
		</h5>
	{/if}
</NavItem>
