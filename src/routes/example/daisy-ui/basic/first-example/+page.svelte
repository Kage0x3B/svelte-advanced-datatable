<script lang="ts">
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import { LocalDataSource } from '$lib/dataSource/LocalDataSource.svelte.js';
    import { DataTable } from '$lib/daisyUi/index.js';
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

    const dataSource = new LocalDataSource(exampleUserList, {
        filtering: {
            textSearchColumns: ['userName']
        }
    });
</script>

<DataTable {config} {dataSource} />
