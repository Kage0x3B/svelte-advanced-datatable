<script>
	import { Button, Container } from 'sveltestrap';
	import Footer from '../util/Footer.svelte';
</script>

<svelte:head>
	<title>Svelte Advanced Datatable</title>
</svelte:head>

<div id='page-container'>
	<Container class='pt-6 pb-6'>
		<div class='mb-6'>
			<h1 class='display-1'>Svelte Advanced Datatable</h1>
			<p class='lead'>
				A highly configurable datatable for Svelte and Sveltestrap UI components (and more soon)
			</p>
		</div>
		<Button href='/docs/getting-started' color='primary' size='lg'>Explore docs</Button>
		<Button href='/api-reference' color='primary' outline size='lg'>API Reference</Button>
	</Container>
	<Footer />
</div>


<style>
    #page-container {
        position: relative;
        min-height: calc(100vh - 56px);
    }
</style>
