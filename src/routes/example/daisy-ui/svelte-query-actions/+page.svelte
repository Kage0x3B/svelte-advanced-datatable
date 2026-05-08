<script lang="ts">
    import { wrapFetchToThrow } from '$lib/util/generalUtil.js';
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { SelectionId } from '$lib/types/SelectionId.js';
    import { SvelteQueryDataSource } from '$lib/dataSource/svelteQuery/SvelteQueryDataSource.svelte.js';
    import { DataTable } from '$lib/daisyUi/index.js';
    import ArchiveIcon from './ArchiveIcon.svelte';
    import PencilIcon from './PencilIcon.svelte';
    import TrashIcon from './TrashIcon.svelte';

    interface UserData {
        id: number;
        userName: string;
        firstName: string;
        lastName: string;
        mailAddress: string;
        gender: 'male' | 'female';
    }

    /** Fake mutation log shown next to the table so the demo doesn't need a
     *  real backend. Each action handler appends an entry here. */
    let lastAction: string = $state('—');

    let selectedIds: SelectionId[] = $state([]);

    const config = {
        type: 'userDataActions',
        columnProperties: {
            id: { type: ComponentType.NUMBER },
            userName: { type: ComponentType.STRING },
            firstName: { type: ComponentType.STRING },
            lastName: { type: ComponentType.STRING },
            mailAddress: { type: ComponentType.STRING }
        },
        dataUniquePropertyKey: 'id',
        messageConfig: {
            id: { label: 'Id' },
            userName: { label: 'Username' },
            firstName: { label: 'First name' },
            lastName: { label: 'Last name' },
            mailAddress: { label: 'Email' },
            actions: {
                edit: 'Edit',
                archive: 'Archive',
                delete: 'Delete'
            }
        },
        actions: [
            {
                key: 'edit',
                icon: PencilIcon,
                onSingle: (item) => {
                    lastAction = `Edit user #${item.id} (${item.userName})`;
                }
            },
            {
                key: 'archive',
                icon: ArchiveIcon,
                primary: true,
                onMulti: (ids) => {
                    lastAction = `Archive ${ids.length} user(s): [${ids.join(', ')}]`;
                }
            },
            {
                key: 'delete',
                icon: TrashIcon,
                variant: 'destructive',
                primary: true,
                onMulti: (ids) => {
                    lastAction = `Delete ${ids.length} user(s): [${ids.join(', ')}]`;
                }
            }
        ]
    } satisfies DataTableConfig<UserData>;

    const dataSource = new SvelteQueryDataSource(wrapFetchToThrow(() => fetch('/example-data/users.json')));
</script>

<div class="space-y-4">
    <h1 class="text-2xl font-semibold">Selection + Actions</h1>
    <p class="text-base-content/70 max-w-3xl">
        Selecting a row exposes the bulk-action toolbar to the right of the search field. Every
        row also gets a three-dot menu with the same actions in single-row form. Clicking
        "Archive" or "Delete" with no selection is impossible — those buttons only appear when
        at least one row is selected.
    </p>

    <div class="bg-base-200 grid grid-cols-1 gap-4 rounded-md p-3 sm:grid-cols-2">
        <div class="min-w-0">
            <div class="text-sm font-medium opacity-70">Selected ids ({selectedIds.length})</div>
            <code class="block max-h-16 overflow-auto text-xs break-all">
                {JSON.stringify(selectedIds)}
            </code>
        </div>
        <div class="min-w-0">
            <div class="text-sm font-medium opacity-70">Last action</div>
            <code class="block text-xs break-words">{lastAction}</code>
        </div>
    </div>

    <DataTable
        {config}
        {dataSource}
        bind:selectedIds
        onSelectionChange={({ ids }) => {
            // Just demonstrating the callback fires alongside the bind; in
            // real apps you'd usually pick one of the two patterns.
            console.log('selection changed', ids);
        }}
    />
</div>
