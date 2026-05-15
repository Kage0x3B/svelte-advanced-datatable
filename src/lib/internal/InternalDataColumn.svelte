<script lang="ts">
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
    import type { CustomSnippetProps } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import type { BadgeComponentProps } from '$lib/types/BadgeComponentProps.js';
    import type { IconComponentProps } from '$lib/types/IconComponentProps.js';
    import { configContext, messageFormatterContext } from '$lib/util/context.js';
    import { isDateTime } from '$lib/util/generalUtil.js';
    import type { Component } from 'svelte';

    const config = $derived(configContext.get().current);
    const format = $derived(messageFormatterContext.get().current);

    interface Props {
        IconComponent: Component<IconComponentProps>;
        BadgeComponent: Component<BadgeComponentProps>;
        item: Record<string, unknown>;
        key: string;

        customSnippets: CustomSnippetProps;
    }

    let { IconComponent, BadgeComponent, item, key, customSnippets }: Props = $props();

    const colProps = $derived(config.columnProperties[key] as unknown as ComponentTypeProperties);
    const columnSnippetName = $derived((key + 'Snippet') as `${string}Snippet`);
</script>

<style>
    /* Visually hidden text alternative for icon-only renderings (boolean
       check/cross). Inlined so the rule survives consumer setups without
       Tailwind preflight. */
    .datatable-sr-only {
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

<!-- It's better for performance to generate some fields for easy types (string, int, enum, bool, ..) with a simple if -->
{#if colProps.formatValue}
    {#if colProps.formatValueEnableHtml}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html colProps.formatValue(item[key], item)}
    {:else}
        {colProps.formatValue(item[key], item)}
    {/if}
{:else if customSnippets[columnSnippetName]}
    {@const columnSnippet = customSnippets[columnSnippetName]}
    {@render columnSnippet({ key, value: item[key], item, colProps })}
{:else if colProps.type === ComponentType.CUSTOM}
    {#if colProps.snippet}
        {@render colProps.snippet({ key, value: item[key], item, colProps })}
    {:else if colProps.component}
        <colProps.component {key} {colProps} {item} value={item[key]} />
    {/if}
{:else if colProps.type === ComponentType.STRING || colProps.type === ComponentType.NUMBER}
    {#if typeof item[key] !== 'undefined' && item[key] !== null && item[key] !== 'null'}
        {format(`dataTable.${config.type}.${key}.format`, {
            default: String(item[key]),
            values: { value: String(item[key]) }
        })}
    {/if}
{:else if colProps.type === ComponentType.BOOLEAN}
    <!-- Comparison with two equals intended!! -->
    {#if (!colProps.inverted && item[key] == (colProps.truthy ?? true)) || (colProps.inverted && item[key] != (colProps.truthy ?? true))}
        <IconComponent name="check" color="green" />
        <span class="datatable-sr-only">
            {format('dataTable.aria.boolean.true', { default: 'Yes' }) ?? 'Yes'}
        </span>
    {:else}
        <IconComponent name="cross" color="red" />
        <span class="datatable-sr-only">
            {format('dataTable.aria.boolean.false', { default: 'No' }) ?? 'No'}
        </span>
    {/if}
{:else if colProps.type === ComponentType.ENUM}
    <BadgeComponent
        color={colProps.values.includes(item[key])
            ? (colProps.enumColorKey[item[key]] ?? colProps.enumColorKey.default)
            : colProps.enumColorKey.unknown}
    >
        {#if colProps.values.includes(item[key])}
            {format(`dataTable.${config.type}.${key}.enumValue.${item[key]}`)}
        {:else}
            {format(`dataTable.${config.type}.${key}.enumValue.unknown`)}
        {/if}
    </BadgeComponent>
{:else if colProps.type === ComponentType.DATE}
    <span title={item[key] ?? undefined}>
        {#if isDateTime(item[key])}
            {item[key].toLocaleString(colProps.dateFormat)}
        {:else}
            {item[key]}
        {/if}
    </span>
{:else}
    Error: No component for type {colProps.type}
{/if}
