<script lang='ts'>
	import { Container } from 'sveltestrap';
	import BootstrapStyles from '../../util/BootstrapStyles.svelte';
</script>

<BootstrapStyles />

<Container fluid class='p-5'>
	<slot />
</Container>
