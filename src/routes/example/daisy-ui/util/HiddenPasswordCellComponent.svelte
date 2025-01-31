<script lang="ts">
    import DaisyUiIconWrapper from '$lib/daisyUi/DaisyUiIconWrapper.svelte';
    import Button from '../../../util/Button.svelte';

    interface Props {
        value: string;
    }

    let { value }: Props = $props();

    let isHidden = $state(true);

    function toggle(event: Event) {
        event.stopPropagation();

        isHidden = !isHidden;
    }
</script>

{#if isHidden}
    <Button color="error" size="xs" onclick={toggle}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="size-4">
            <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                <path
                    d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575a1 1 0 0 1 0 .696a10.8 10.8 0 0 1-1.444 2.49m-6.41-.679a3 3 0 0 1-4.242-4.242"
                />
                <path
                    d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151a1 1 0 0 1 0-.696a10.75 10.75 0 0 1 4.446-5.143M2 2l20 20"
                />
            </g>
        </svg>
    </Button>
{:else}
    <code class="bg-light p-1 rounded-2" onclick={toggle}>{value}</code>
{/if}
