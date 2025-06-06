<script lang="ts">
    interface Props {
        path: string;
        description: string;
    }

    let { path, description }: Props = $props();

    let iframeContainer = $state<HTMLDivElement>();
</script>

<div class="mt-4 mb-5" bind:this={iframeContainer}>
    <div class="ratio ratio-21x9 border rounded">
        <iframe
            src="/example/{path}"
            title="Example table {path}"
            width={(iframeContainer?.clientWidth ?? 400) - 4}
            height="600"
        ></iframe>
    </div>

    {#if description}
        <div class="d-flex justify-content-center mt-1 mb-5 text-muted">
            <small>{description}</small>
        </div>
    {/if}
</div>
