<script lang="ts">
    import type { DataTableConfig } from '$lib';
    import { ComponentType, wrapFetchToThrow } from '$lib';
    import { SvelteQueryDataSource } from '$lib/dataSource/svelteQuery';
    import { DataTable } from '$lib/skeleton';

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
        dataSource: new SvelteQueryDataSource(wrapFetchToThrow(() => fetch('/example-data/users.json'))),
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
</script>

<DataTable {config} />
