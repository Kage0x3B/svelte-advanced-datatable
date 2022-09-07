<script lang='ts'>
	import type { DataTableConfig } from '$lib';
	import { ComponentType } from '$lib';
	import { DataTable } from '$lib/sveltestrap';
	import { useQuery } from '@sveltestack/svelte-query';
	import { SvelteQueryDataSource } from '$lib/dataSource/SvelteQueryDataSource.js';

	interface UserData {
		id: number;
		userName: string;
	}

	const userQuery = useQuery('userData', data => fetch('/example-data/', {
		body: JSON.stringify(data)
	}));

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
		dataSource: new SvelteQueryDataSource(),
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
