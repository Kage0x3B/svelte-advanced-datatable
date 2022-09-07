import { faker } from '@faker-js/faker';

export function createExampleData<T>(
	dataGenerator: () => T,
	amount = {
		min: 100,
		max: 300
	}
): T[] {
	const dataAmount = faker.datatype.number(amount);

	return Array.from({ length: dataAmount }, dataGenerator);
}
