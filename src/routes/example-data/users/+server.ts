import { faker } from '@faker-js/faker';
import type { RequestEvent } from '@sveltejs/kit';
import { createExampleData, createExamplePaginatedListResponse } from '../exampleDataUtil.js';
import type { UserData } from './UserData.js';

let idCounter = 1;

const exampleUserList = createExampleData<UserData>(() => {
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

export function POST(request: RequestEvent): Promise<Response> {
	return createExamplePaginatedListResponse({
		request,
		exampleData: exampleUserList,
		filterOptions: {
			textSearchColumns: ['userName', 'firstName', 'lastName', 'mailAddress']
		}
	});
}
