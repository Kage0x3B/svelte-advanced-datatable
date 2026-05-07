<script lang="ts">
    import type { CustomComponentProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';

    let { value }: CustomComponentProps<number> = $props();

    const tone = $derived(value >= 100 ? 'progress-success' : value >= 60 ? 'progress-info' : value >= 30 ? 'progress-warning' : 'progress-error');
</script>

<div class="flex items-center gap-2">
    <progress class="progress {tone} w-24" {value} max="100"></progress>
    <span class="font-mono text-xs tabular-nums">{value}%</span>
</div>
