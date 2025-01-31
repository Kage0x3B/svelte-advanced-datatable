<script lang="ts">
    import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
    import type { LayoutProps } from './$types.js';

    let { children }: LayoutProps = $props();

    const queryClient = new QueryClient();
</script>

<QueryClientProvider client={queryClient}>
    {@render children()}
</QueryClientProvider>
