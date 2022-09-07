<script lang='ts'>
	import { page } from '$app/stores';
	import { NavItem, NavLink } from 'sveltestrap';

	const docsBaseUrl = '/docs/';

	export let href: string | undefined = undefined;
	export let heading = false;

	export let matchActiveRegex: RegExp | undefined = undefined;
	export let matchActiveExact = href === '/';

	$: fullHref = docsBaseUrl + href?.toLowerCase();
	$: currentPath = $page.url.pathname.toLowerCase();
	$: active = !!href && (matchActiveRegex ? matchActiveRegex!.test(currentPath) : matchActiveExact ? currentPath === fullHref : currentPath.startsWith(fullHref));
</script>

<NavItem class=''>
	{#if href}
		<NavLink class='p-3 pb-0' href={fullHref} {active}>
			<slot />
		</NavLink>
	{:else if heading}
		<h5 class='p-3 pb-0 mb-0 fw-bold'>
			<slot />
		</h5>
	{/if}
</NavItem>
