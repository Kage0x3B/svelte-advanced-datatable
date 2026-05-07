<script lang="ts">
    import type { CustomComponentProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import type { Project } from './projectData.js';

    let { value }: CustomComponentProps<Project['owner']> = $props();

    const initials = $derived(`${value.firstName[0] ?? ''}${value.lastName[0] ?? ''}`.toUpperCase());

    // Stable hash → hue so the same name always gets the same colour.
    const hue = $derived.by(() => {
        const seed = `${value.firstName}${value.lastName}`;
        let h = 0;
        for (let i = 0; i < seed.length; i++) {
            h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        }
        return h % 360;
    });
</script>

<div class="flex items-center gap-2">
    <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style="background-color: hsl({hue} 60% 45%);"
    >
        {initials}
    </div>
    <span class="text-sm whitespace-nowrap">{value.firstName} {value.lastName}</span>
</div>
