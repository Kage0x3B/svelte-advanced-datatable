<script lang='ts'>
	import BootstrapStyles from './util/BootstrapStyles.svelte';
	import MainNavbar from './util/MainNavbar.svelte';
</script>

<BootstrapStyles />
<MainNavbar />

<slot />

<div class='d-flex flex-column justify-content-center align-items-center'>
	<h1 class='text-primary mb-5'>
		404
	</h1>
	<h2 class='text-gray'>We couldn't find the page you were looking for!</h2>
	<h3>
		<a href='/'>Go back to the homepage</a>
	</h3>
</div>

<style>
    div {
        min-height: 60vh;
    }

    h1 {
        font-size: 6rem;
        font-weight: 600;
        text-shadow: 0 3px 0 #b2a98f,
        0 14px 10px rgba(0, 0, 0, 0.15),
        0 24px 2px rgba(0, 0, 0, 0.1),
        0 34px 30px rgba(0, 0, 0, 0.1);
    }

    a {
        text-decoration: none;
    }
</style>
