/**
 * Wires a `<details>` dropdown so clicking outside dismisses it. Native
 * `<details>` only toggles via its `<summary>`, which surprises users who
 * expect popovers to close on outside-click. Keeps the listener cheap by
 * binding once per element and removing on cleanup.
 *
 * Use inside a component setup as an `$effect`:
 * ```svelte
 * <script>
 *   let detailsEl: HTMLDetailsElement | undefined = $state();
 *   $effect(() => attachDetailsAutoClose(detailsEl));
 * </script>
 * <details bind:this={detailsEl}>...</details>
 * ```
 */
export function attachDetailsAutoClose(el: HTMLDetailsElement | undefined): (() => void) | void {
    if (!el) return;
    const handler = (event: MouseEvent) => {
        if (el.open && event.target instanceof Node && !el.contains(event.target)) {
            el.removeAttribute('open');
        }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
}
