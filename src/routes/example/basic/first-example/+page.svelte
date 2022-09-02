<script lang='ts'>
	import type { DataTableConfig } from '$lib';
	import { ComponentType, FetchApiDataSource } from '$lib';
	import { DataTable } from '$lib/sveltestrap';

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
</script>

<DataTable {config} />
