import { faker } from '@faker-js/faker';
import type { DataRecord } from '$lib/index.js';
import { createExampleData } from './exampleDataUtil.js';

export interface UserData extends DataRecord {
	id: number;
	userName: string;
	firstName: string;
	lastName: string;
	mailAddress: string;
	/**
	 * This is only example data for showcasing the datatables.
	 * --> Never store passwords in plaintext anywhere!
	 */
	password: string;
	gender: 'male' | 'female';
}

let idCounter = 1;

export const exampleUserList = createExampleData<UserData>(() => {
	const gender = faker.datatype.boolean() ? 'male' : 'female';
	const firstName = faker.name.firstName(gender);
	const lastName = faker.name.lastName(gender);

	return {
		id: idCounter++,
		userName: faker.internet.userName(firstName, lastName),
		firstName,
		lastName,
		mailAddress: faker.internet.email(firstName, lastName),
		password: faker.internet.password(),
		gender
	};
});
