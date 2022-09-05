<script>
	import DocsHeading from '../util/DocsHeading.svelte';
	import DocsCode from '../util/DocsCode.svelte';
	import typescript from 'svelte-highlight/languages/typescript';

	const quickStartUserData = `
interface UserData {
	id: number;
	userName: string;
}
`;

	const quickStartDatatable = `
<script lang='ts'>
    import type { DataTableConfig } from 'svelte-advanced-datatable';
    import { ComponentType, FetchApiDataSource } from 'svelte-advanced-datatable';
    import { DataTable } from 'svelte-advanced-datatable/sveltestrap';

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
        dataSource: new FetchApiDataSource('/api/users/list'),
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
&lt;/script>

<DataTable {config} />
`;

</script>

<DocsHeading title='Quick Start' />

You can install Svelte Advanced Datatable with your favorite package manager

<DocsCode code={quickStartUserData} language={typescript} />
<DocsCode code={quickStartDatatable} language='svelte' />
