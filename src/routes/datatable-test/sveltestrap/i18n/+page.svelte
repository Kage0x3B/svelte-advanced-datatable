<script lang='ts'>
	import { ComponentType } from '$lib/dataComponent/ComponentType.js';
	import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
	import { FetchApiDataSource } from '$lib/dataSource/FetchApiDataSource.js';
	import { DataTable } from '$lib/sveltestrap/index.js';
	import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
	import type { UserData } from '../../../example-data/users/UserData.js';
	import HiddenPasswordCellComponent from '../util/HiddenPasswordCellComponent.svelte';

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
				type: ComponentType.CUSTOM,
				sortable: false,
				component: HiddenPasswordCellComponent
			},
			gender: {
				type: ComponentType.ENUM,
				values: ['male', 'female'],
				enumColorKey: {
					male: 'info',
					female: 'danger',
					default: 'primary',
					unknown: 'secondary'
				}
			} as EnumComponentTypeProperties<'male' | 'female'>
		},
		dataSource: new FetchApiDataSource('/example-data/users'),
		dataUniquePropertyKey: 'id',
		messageFormatterType: 'svelte-i18n'
	};
</script>

<DataTable {config}
	highlight
	hoverable responsive
	striped />
