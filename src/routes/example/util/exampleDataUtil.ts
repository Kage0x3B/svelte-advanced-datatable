import { faker } from '@faker-js/faker';

export function createExampleData<Data>(
	dataGenerator: () => Data,
	amount = {
		min: 100,
		max: 300
	}
): Data[] {
	const dataAmount = faker.datatype.number(amount);

	return Array.from({ length: dataAmount }, dataGenerator);
}
