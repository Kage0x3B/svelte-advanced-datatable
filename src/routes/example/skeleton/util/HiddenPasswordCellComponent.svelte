<script lang="ts">
    import SkeletonIconWrapper from '$lib/skeleton/SkeletonIconWrapper.svelte';
    import Button from '../../../util/Button.svelte';


    
    interface Props {
        value: string;
        // Export unneeded variables to hide "created with unknown prop" warnings
        key?: any;
        colProps?: any;
        item?: any;
    }

    let {
        value,
        key = undefined,
        colProps = undefined,
        item = undefined
    }: Props = $props();

    let isHidden = $state(true);

    function toggle(event: Event) {
        event.stopPropagation();

        isHidden = !isHidden;
    }
</script>

{#if isHidden}
    <Button color="danger" size="sm" on:click={toggle}>
        <SkeletonIconWrapper name="eye-slash-fill" />
    </Button>
{:else}
    <code class="bg-light p-1 rounded-2" onclick={toggle}>{value}</code>
{/if}
