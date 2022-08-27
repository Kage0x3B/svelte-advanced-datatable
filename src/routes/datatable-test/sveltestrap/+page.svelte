<script lang='ts'>
	import DataTable from '$lib/DataTable.svelte';
	import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
	import { Styles } from 'sveltestrap';
	import { ComponentType } from '../../../lib/dataComponent/ComponentType.js';
	import type { EnumComponentTypeProperties } from '../../../lib/dataComponent/EnumComponentTypeProperties.js';
	import { FetchApiDataSource } from '../../../lib/dataSource/FetchApiDataSource.js';
	import type { UserData } from '../../example-data/users/UserData.js';

	const config: DataTableConfig<UserData> = {
		type: 'userData',
		columnProperties: {
			id: {
				type: ComponentType.NUMBER
			},
			userName: {
				type: ComponentType.STRING
			},
			firstName: {
				type: ComponentType.STRING
			},
			lastName: {
				type: ComponentType.STRING
			},
			mailAddress: {
				type: ComponentType.STRING
			},
			password: {
				type: ComponentType.STRING
			},
			gender: {
				type: ComponentType.ENUM,
				values: ['male', 'female'],
				enumColorKey: {
					male: 'warning',
					female: 'info',
					default: 'primary',
					unknown: 'secondary'
				}
			} as EnumComponentTypeProperties<'male' | 'female'>
		},
		dataSource: new FetchApiDataSource('/example-data/users'),
		dataUniquePropertyKey: 'id'
	};
</script>

<DataTable {config}
	highlight
	hoverable responsive
	striped />

<Styles />
