<script>
	import { Container, Icon } from 'sveltestrap';
</script>

<div class='footer py-3'>
	<Container>
		<div class='d-flex justify-content-between'>
			<div class='d-flex align-items-center text-dark'>
				© 2022&nbsp;<a href='https://moritz.website' class='text-dark text-decoration-none'>Moritz Hein</a>
			</div>
			<div>
				<a href='https://github.com/Kage0x3B/svelte-advanced-datatable'>
					<Icon name='github' class='icon-footer' />
				</a>
			</div>
		</div>
	</Container>
</div>


<style>
    .footer {
        position: absolute;
        bottom: 0;
        width: 100%;
    }
</style>
