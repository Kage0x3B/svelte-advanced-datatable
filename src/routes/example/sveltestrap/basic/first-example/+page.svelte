<script lang='ts'>
	import type { DataTableConfig } from '$lib';
	import { ComponentType } from '$lib';
	import { DataTable } from '$lib/sveltestrap';
	import { LocalDataSource } from '$lib/dataSource/LocalDataSource.js';
	import { exampleUserList } from '../../../util/UserData.js';

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
