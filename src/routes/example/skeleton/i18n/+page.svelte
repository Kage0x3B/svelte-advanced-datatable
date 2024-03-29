<script lang="ts">
    import type { DataTableConfig, EnumComponentTypeProperties } from '$lib';
    import { LocalDataSource } from '$lib';
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import { DataTable } from '$lib/skeleton/index.js';
    import { addMessages, getLocaleFromNavigator, init } from 'svelte-i18n';
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
                    male: 'info',
                    female: 'danger',
                    default: 'primary',
                    unknown: 'secondary'
                }
            } as EnumComponentTypeProperties<'male' | 'female'>
        },
        dataSource: new LocalDataSource(exampleUserList, {
            filtering: {
                textSearchColumns: ['userName']
            }
        }),
        dataUniquePropertyKey: 'id',
        messageFormatterType: 'svelte-i18n'
    };
</script>

<DataTable {config} highlight hoverable responsive striped />
