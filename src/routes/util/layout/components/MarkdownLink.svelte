<script lang="ts">
    export let href: string;
    export let rel = '';
</script>

<a {href} {rel} class="text-primary-500 hover:text-primary-400 focus:text-primary-600">
    <slot />
</a>
