<script>
	import DocsHeading from '../util/DocsHeading.svelte';
	import DocsCode from '../util/DocsCode.svelte';
	import shell from 'svelte-highlight/languages/shell';

	const installCode = `
$ npm i svelte-advanced-datatable
$ pnpm add @sveltestack/svelte-query`;
</script>

<DocsHeading title='Installation' />

You can install Svelte Advanced Datatable with your favorite package manager

<DocsCode code={installCode} language={shell} />
