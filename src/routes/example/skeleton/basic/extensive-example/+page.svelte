<script lang="ts">
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
    import { LocalDataSource } from '$lib/index.js';
    import { DataTable } from '$lib/skeleton/index.js';
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { UserData } from '../../../util/UserData.js';
    import { exampleUserList } from '../../../util/UserData.js';
    import HiddenPasswordCellComponent from '../../util/HiddenPasswordCellComponent.svelte';

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
            }
        }
    };
</script>

<DataTable {config} highlight hoverable responsive striped />
