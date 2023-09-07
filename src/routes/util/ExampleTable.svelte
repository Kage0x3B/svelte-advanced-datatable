<script lang="ts">
    export let path: string;
    export let description: string;
</script>

<div class="mt-4 mb-5">
    <div class="w-full aspect-[16/9] border border-1 rounded-xl overflow-hidden shadow-lg">
        <iframe src="/example/{path}" title="Example table {path}" class="w-full h-full overflow-scroll"></iframe>
    </div>

    {#if description}
        <div class="flex justify-center mt-1 mb-5 text-surface-500">
            <small>{description}</small>
        </div>
    {/if}
</div>
