<script lang="ts">
    import type { CustomComponentProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';

    let { value }: CustomComponentProps<Date> = $props();

    const date = $derived(new Date(value));
    const daysLeft = $derived(Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    const tone = $derived(daysLeft < 0 ? 'badge-error' : daysLeft < 14 ? 'badge-warning' : 'badge-ghost');
    const formatted = $derived(
        date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    );
    const relative = $derived(
        daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'today' : `in ${daysLeft}d`
    );
</script>

<div class="flex items-center gap-2">
    <span class="text-sm whitespace-nowrap">{formatted}</span>
    <span class="badge badge-sm {tone} whitespace-nowrap">{relative}</span>
</div>
