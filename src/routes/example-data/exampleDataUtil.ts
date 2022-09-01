import type { DataRecord } from '$lib/types/DataRecord.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
import type { ParsedSearchQuery } from '$lib/types/ParsedSearchQuery.js';
import { faker } from '@faker-js/faker';
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

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

type FilterOptions<T> = {
	textSearchColumns?: (keyof T)[];
	filterFunction?: (item: T, searchQuery: ParsedSearchQuery) => boolean;
};

function filterData<T extends DataRecord>({
	data,
	searchQuery,
	filterOptions
}: {
	data: T[];
	searchQuery: PaginatedListRequest<T>['searchQuery'] | undefined;
	filterOptions: FilterOptions<T>;
}): T[] {
	if (!searchQuery) {
		return data;
	}

	if (filterOptions.textSearchColumns?.length && searchQuery.searchText?.trim()) {
		data = data.filter((item) => {
			for (const columnKey of filterOptions.textSearchColumns!) {
				if (String(item[columnKey]).toLowerCase().indexOf(searchQuery.searchText.toLowerCase()) !== -1) {
					return true;
				}
			}

			return false;
		});
	}

	if (filterOptions.filterFunction) {
		data = data.filter((item) => filterOptions.filterFunction!(item, searchQuery));
	}

	return data;
}

function sortData<T extends DataRecord>({
	data,
	orderBy
}: {
	data: T[];
	orderBy: PaginatedListRequest<T>['orderBy'] | undefined;
}): T[] {
	if (!orderBy) {
		return data;
	}

	const key = orderBy.column;

	const exampleValue = data.find((item) => typeof item[key] !== 'undefined' && item[key] !== null);

	if (typeof exampleValue === 'number') {
		return data.sort((a, b) => {
			const n1 = Number(a[key]);
			const n2 = Number(b[key]);

			return orderBy.order === 'asc' ? n1 - n2 : n2 - n1;
		});
	} else {
		return data.sort((a, b) => {
			const s1 = String(a[key]);
			const s2 = String(b[key]);

			return orderBy.order === 'asc' ? s1.localeCompare(s2) : s2.localeCompare(s1);
		});
	}
}

export async function createExamplePaginatedListResponse<T extends DataRecord>({
	request,
	exampleData,
	filterOptions
}: {
	request: RequestEvent;
	exampleData: T[];
	filterOptions: FilterOptions<T>;
}): Promise<Response> {
	const { start, amount, orderBy, searchQuery } = (await request.request.json()) as PaginatedListRequest<T>;

	const dataList = JSON.parse(JSON.stringify(exampleData));

	const filteredData = filterData({
		data: dataList,
		searchQuery,
		filterOptions
	});
	const sortedData = sortData({
		data: filteredData,
		orderBy
	});
	const paginatedData = sortedData.slice(start, start + amount);

	const responseData: PaginatedListResponse<T> = {
		totalCount: exampleData.length,
		items: paginatedData
	};

	return json(responseData);
}
