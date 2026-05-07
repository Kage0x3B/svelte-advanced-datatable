<script lang="ts">
    import type { CustomComponentProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import type { Project } from './projectData.js';

    let { item }: CustomComponentProps<unknown, Project> = $props();

    function archive(event: MouseEvent) {
        // stopPropagation so the row's modal doesn't toggle on click
        event.stopPropagation();
        alert(`Archive: ${item.name}`);
    }
</script>

<button class="btn btn-xs btn-ghost text-error" onclick={archive} title="Archive project">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    >
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
</button>
