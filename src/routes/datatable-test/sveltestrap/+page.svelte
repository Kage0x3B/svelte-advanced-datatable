<script lang='ts'>
	import DataTable from '$lib/DataTable.svelte';
	import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
	import { Col, Container, Row, Styles } from 'sveltestrap';
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
				type: ComponentType.STRING,
				sortable: false
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

<Container>
	<Row>
		<Col xs='12' class='py-5'>
			<DataTable {config}
				highlight
				hoverable responsive
				striped />
		</Col>
	</Row>
</Container>

<Styles />
