<script lang="ts">
    import type { Snippet } from 'svelte';
    import MarkdownHeading from './MarkdownHeading.svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
</script>

<MarkdownHeading h2>
    {@render children()}
</MarkdownHeading>
