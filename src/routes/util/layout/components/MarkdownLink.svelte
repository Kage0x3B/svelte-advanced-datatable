<script lang="ts">
    export let href: string;
    export let rel = '';

    $: isExternal = href.startsWith('http');
</script>

<a
    {href}
    rel={isExternal ? 'external' : rel}
    target={isExternal ? '_blank' : undefined}
    class="text-primary-500 hover:text-primary-400 focus:text-primary-600"
>
    <slot />
</a>
