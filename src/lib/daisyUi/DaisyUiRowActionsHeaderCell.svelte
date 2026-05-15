<script lang="ts">
    import { configContext, messageFormatterContext } from '$lib/util/context.js';
    import { resolveActionLabel } from '$lib/util/actionLabelUtil.js';

    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);
    const screenReaderLabel = $derived(
        resolveActionLabel(config, format, 'rowActions', 'Actions')
    );
</script>

<th scope="col" class="datatable-row-actions-th" data-column-key="__rowActions">
    <span class="sr-only">{screenReaderLabel}</span>
</th>

<style>
    .datatable-row-actions-th {
        width: 3rem;
        padding-inline: 0.25rem;
    }

    .sr-only {
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
