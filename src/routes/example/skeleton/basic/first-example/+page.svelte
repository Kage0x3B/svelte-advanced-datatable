<script lang="ts">
    import type { DataTableConfig } from '$lib';
    import { ComponentType } from '$lib';
    import { LocalDataSource } from '$lib/dataSource/LocalDataSource.js';
    import { DataTable } from '$lib/skeleton';
    import type { UserData } from '../../../util/UserData.js';
    import { exampleUserList } from '../../../util/UserData.js';

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
        dataSource: new LocalDataSource(exampleUserList, {
            filtering: {
                textSearchColumns: ['userName']
            }
        }),
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
