<script lang="ts">
    import type { BooleanComponentTypeProperties } from '$lib';
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
    import { LocalDataSource } from '$lib/dataSource/LocalDataSource.svelte.js';
    import { DataTable } from '$lib/daisyUi/index.js';
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import { exampleUserList, type UserData } from '../../../util/UserData.js';
    import HiddenPasswordCellComponent from '../../util/HiddenPasswordCellComponent.svelte';

    type ListItem = UserData;

    const config = $derived({
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
            } as EnumComponentTypeProperties<'male' | 'female'>,
            isTestUser: {
                type: ComponentType.BOOLEAN
            } satisfies BooleanComponentTypeProperties
        },
        buildItemUrl: (item) => `/example/daisy-ui/basic/extensive-example#${item.id}`,
        dataUniquePropertyKey: 'id',
        messageConfig: {
            id: {
                label: 'Id'
            },
            userName: {
                label: 'Username'
            },
            firstName: {
                label: 'First Name'
            },
            lastName: {
                label: 'Last Name'
            },
            mailAddress: {
                label: 'E-Mail Address'
            },
            password: {
                label: 'Password'
            },
            gender: {
                label: 'Gender',
                enumValue: {
                    male: 'Male',
                    female: 'Female'
                }
            },
            isTestUser: {
                label: 'Test User'
            }
        }
    } satisfies DataTableConfig<ListItem>);

    const dataSource = new LocalDataSource(exampleUserList, {
        filtering: {
            textSearchColumns: ['userName']
        }
    });
</script>

<DataTable {config} {dataSource} hoverable striped />
