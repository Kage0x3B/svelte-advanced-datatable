<script lang="ts">
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { CustomComponentTypeProperties } from '$lib/dataComponent/CustomComponentTypeProperties.js';
    import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
    import { LocalDataSource } from '$lib/dataSource/LocalDataSource.svelte.js';
    import { DataTable } from '$lib/daisyUi/index.js';
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import ActionsCell from './util/ActionsCell.svelte';
    import AvatarCell from './util/AvatarCell.svelte';
    import DueDateCell from './util/DueDateCell.svelte';
    import ProgressCell from './util/ProgressCell.svelte';
    import { exampleProjectList, type Project, type ProjectStatus } from './util/projectData.js';

    const config = $derived({
        type: 'projects',
        columnProperties: {
            id: {
                type: ComponentType.NUMBER
            },
            name: {
                type: ComponentType.STRING
            },
            owner: {
                type: ComponentType.CUSTOM,
                sortable: false,
                component: AvatarCell
            } satisfies CustomComponentTypeProperties<Project['owner']>,
            status: {
                type: ComponentType.ENUM,
                values: ['planning', 'active', 'review', 'shipped'],
                enumColorKey: {
                    planning: 'gray',
                    active: 'blue',
                    review: 'yellow',
                    shipped: 'green',
                    default: 'gray',
                    unknown: 'gray'
                }
            } as EnumComponentTypeProperties<ProjectStatus>,
            progress: {
                type: ComponentType.CUSTOM,
                sortable: true,
                component: ProgressCell
            } satisfies CustomComponentTypeProperties<number>,
            budget: {
                type: ComponentType.NUMBER,
                formatValue: (value) =>
                    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value as number)
            },
            dueAt: {
                type: ComponentType.CUSTOM,
                sortable: true,
                component: DueDateCell
            } satisfies CustomComponentTypeProperties<Date>,
            actions: {
                type: ComponentType.CUSTOM,
                sortable: false,
                hidden: false,
                component: ActionsCell
            } satisfies CustomComponentTypeProperties<unknown>
        },
        dataUniquePropertyKey: 'id',
        messageConfig: {
            id: { label: 'Id' },
            name: { label: 'Project' },
            owner: { label: 'Owner' },
            status: {
                label: 'Status',
                enumValue: {
                    planning: 'Planning',
                    active: 'Active',
                    review: 'Review',
                    shipped: 'Shipped'
                }
            },
            progress: { label: 'Progress' },
            budget: { label: 'Budget' },
            dueAt: { label: 'Due' },
            actions: { label: ' ' }
        }
    } satisfies DataTableConfig<Project>);

    const dataSource = new LocalDataSource(exampleProjectList, {
        filtering: {
            textSearchColumns: ['name']
        }
    });
</script>

<div class="mb-6">
    <h1 class="text-2xl font-bold">Custom column components</h1>
    <p class="text-base-content/70">
        Five different uses of <code>ComponentType.CUSTOM</code>: an initials avatar with a deterministic colour, an
        inline progress bar with tonal colours, a due date with a relative-time badge, currency formatting via
        <code>formatValue</code>, and per-row action buttons that <code>stopPropagation</code> so they don't open the
        modal.
    </p>
</div>

<DataTable {config} {dataSource} hoverable striped />
