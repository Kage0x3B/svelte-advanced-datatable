<script lang="ts">
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
    import { LocalDataSource } from '$lib/dataSource/LocalDataSource.svelte.js';
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import { DataTable } from '$lib/daisyUi/index.js';
    import { addMessages, format, getLocaleFromNavigator, init } from 'svelte-i18n';
    import type { UserData } from '../../util/UserData.js';
    import { exampleUserList } from '../../util/UserData.js';
    import HiddenPasswordCellComponent from '../util/HiddenPasswordCellComponent.svelte';
    import localeDe from '../util/i18n/de.json';
    import localeEn from '../util/i18n/en.json';

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
                    male: 'blue',
                    female: 'red',
                    default: 'gray',
                    unknown: 'gray'
                }
            } as EnumComponentTypeProperties<'male' | 'female'>
        },
        dataUniquePropertyKey: 'id',
        messageFormatter: format
    };

    const dataSource = new LocalDataSource(exampleUserList, {
        filtering: {
            textSearchColumns: ['userName']
        }
    });
</script>

<DataTable {config} {dataSource} highlight hoverable responsive striped />
