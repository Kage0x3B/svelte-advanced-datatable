<script lang='ts'>
	import { ComponentType } from '$lib/dataComponent/ComponentType.js';
	import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
	import { LocalDataSource } from '$lib/index.js';
	import { DataTable } from '$lib/sveltestrap/index.js';
	import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
	import { addMessages, getLocaleFromNavigator, init } from 'svelte-i18n';
	import type { UserData } from '../../util/UserData.js';
	import { exampleUserList } from '../../util/UserData.js';
	import HiddenPasswordCellComponent from '../util/HiddenPasswordCellComponent.svelte';
	import localeDe from '../util/i18n/de.json';

	import localeEn from '../util/i18n/en.json';
	import UserDataModal from '../util/UserDataModal.svelte';

	addMessages('en', localeEn);
	addMessages('de', localeDe);
	init({
		fallbackLocale: 'en',
		initialLocale: getLocaleFromNavigator()
	});

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
		modalComponent: UserDataModal,
		dataSource: new LocalDataSource(exampleUserList, {
			filtering: {
				textSearchColumns: ['userName']
			}
		}),
		dataUniquePropertyKey: 'id',
		messageFormatterType: 'svelte-i18n'
	};
</script>

<DataTable {config}
	highlight
	hoverable responsive
	striped />
