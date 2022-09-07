<script lang='ts'>
	import type { DataTableConfig } from '$lib';
	import { ComponentType, SvelteQueryDataSource, wrapFetchToThrow } from '$lib';
	import { DataTable } from '$lib/sveltestrap';
	import type { UserData } from '../../util/UserData.js';

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
