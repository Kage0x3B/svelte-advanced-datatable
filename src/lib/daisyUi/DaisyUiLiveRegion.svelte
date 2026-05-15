<script lang="ts">
    import { liveAnnouncerContext } from '$lib/util/context.js';

    const announcer = $derived(liveAnnouncerContext.get().current);
</script>

<div role="status" aria-live="polite" aria-atomic="true" class="datatable-live-region">
    {announcer.message}
</div>

<style>
    /* Visually hidden but exposed to assistive tech (Tailwind's `sr-only`
       equivalent — duplicated here so the component stays self-contained
       and survives consumers without Tailwind's preflight). */
    .datatable-live-region {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
</style>
