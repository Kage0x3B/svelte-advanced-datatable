<script lang="ts">
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { ComponentTypeProperties } from '$lib/dataComponent/ComponentType.js';
    import type { BadgeComponentProps } from '$lib/types/BadgeComponentProps.js';
    import type { IconComponentProps } from '$lib/types/IconComponentProps.js';
    import { getConfigContext, getMessageFormatterContext } from '$lib/util/context.js';
    import { isDateTime } from '$lib/util/generalUtil.js';
    import type { Component } from 'svelte';

    let config = getConfigContext()();
    let format = getMessageFormatterContext()();

    interface Props {
        IconComponent: Component<IconComponentProps>;
        BadgeComponent: Component<BadgeComponentProps>;
        item: Record<string, unknown>;
        key: string;
    }

    let { IconComponent, BadgeComponent, item, key }: Props = $props();

    const colProps = config.columnProperties[key] as unknown as ComponentTypeProperties;
</script>

<!-- It's better for performance to generate some fields for easy types (string, int, enum, bool, ..) with a simple if -->
{#if colProps.type === ComponentType.CUSTOM}
    <colProps.component {key} {colProps} {item} value={item[key]} />
{:else if colProps.type === ComponentType.STRING || colProps.type === ComponentType.NUMBER}
    {#if typeof item[key] !== 'undefined' && item[key] !== null && item[key] !== 'null'}
        {format(`dataTable.${config.type}.${key}.format`, {
            default: String(item[key]),
            values: { value: String(item[key]) }
        })}
    {/if}
{:else if colProps.type === ComponentType.BOOLEAN}
    <!-- Comparison with two equals intended!! -->
    {#if (!colProps.inverted && item[key] == colProps.truthy) || (colProps.inverted && item[key] != colProps.truthy)}
        <IconComponent name="check" color="green" />
    {:else}
        <IconComponent name="cross" color="red" />
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
