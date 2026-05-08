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
                type: ComponentType.NUMBER,
                sortable: true
            },
            userName: {
                type: ComponentType.STRING,
                sortable: true
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
        },
        // Persist transient state (page/search/sort) into URL search params so the
        // current view is shareable, refresh-survivable, and back/forward-aware.
        // URL keys are namespaced as `dt-page`, `dt-q`, `dt-sortCol`, `dt-sortDir`.
        persistence: {
            transient: 'url'
        }
    };

    const dataSource = new LocalDataSource(exampleUserList, {
        filtering: {
            textSearchColumns: ['userName']
        }
    });
</script>

<DataTable {config} {dataSource} />
