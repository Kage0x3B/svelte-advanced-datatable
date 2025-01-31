<script lang="ts">
    import { wrapFetchToThrow } from '$lib/util/generalUtil.js';
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import { SvelteQueryDataSource } from '$lib/dataSource/svelteQuery/SvelteQueryDataSource.svelte.js';
    import { DataTable } from '$lib/daisyUi/index.js';

    interface UserData {
        id: number;
        userName: string;
    }

    const config: DataTableConfig<UserData> = {
        type: 'userData',
        columnProperties: {
            id: {
                type: ComponentType.NUMBER
            },
            userName: {
                type: ComponentType.STRING
            }
        },
        dataUniquePropertyKey: 'id',
        messageConfig: {
            id: {
                label: 'Id'
            },
            userName: {
                label: 'Username'
            }
        }
    };

    const dataSource = new SvelteQueryDataSource(wrapFetchToThrow(() => fetch('/example-data/users.json')));
</script>

<DataTable {config} {dataSource} />
