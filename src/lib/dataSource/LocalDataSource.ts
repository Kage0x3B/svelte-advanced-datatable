import type { ParsedSearchQuery } from '$lib/searchParser/index.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import { AbstractDataSource } from './AbstractDataSource.js';

export interface LocalDataSourceOptions<Data> {
	filtering?: {
		textSearchColumns?: (keyof Data)[];
		filterFunction?: (item: Data, searchQuery: ParsedSearchQuery) => boolean;
	};
}

/**
 * The local data source requires the data to be passed in as an array.
 * The datatable is still paginated, sorted and searchable by performing everything on the clientside
 */
export class LocalDataSource<Data> extends AbstractDataSource<Data> {
	/**
	 * Create a new local data source to use the passed in array as data.
	 *
	 * @param data array with all table entries
	 * @param options
	 */
	constructor(private data: Data[], private options: LocalDataSourceOptions<Data> = {}) {
		super();
	}

	public requestData(data: PaginatedListRequest<Data>): void {
		const { start, amount, orderBy, searchQuery } = data;

		const filteredData = this.filterData({
			data: this.data,
			searchQuery
		});
		const sortedData = this.sortData({
			data: filteredData,
			orderBy
		});
		const paginatedData = sortedData.slice(start, start + amount);

		this.updateStatus({
			data: {
				totalCount: filteredData.length,
				items: paginatedData
			}
		});
	}

	private filterData({
		data,
		searchQuery
	}: {
		data: Data[];
		searchQuery: PaginatedListRequest<Data>['searchQuery'] | undefined;
	}): Data[] {
		if (!searchQuery) {
			return data;
		}

		if (this.options.filtering?.textSearchColumns?.length && searchQuery.searchText?.trim()) {
			data = data.filter((item) => {
				for (const columnKey of this.options!.filtering!.textSearchColumns!) {
					if (
						String(item[columnKey as keyof typeof item])
							.toLowerCase()
							.indexOf(searchQuery.searchText.toLowerCase()) !== -1
					) {
						return true;
					}
				}

				return false;
			});
		}

		if (this.options.filtering?.filterFunction) {
			// @ts-ignore
			data = data.filter((item) => this.options.filtering!.filterFunction!(item, searchQuery));
		}

		return data;
	}

	private sortData({
		data,
		orderBy
	}: {
		data: Data[];
		orderBy: PaginatedListRequest<Data>['orderBy'] | undefined;
	}): Data[] {
		if (!orderBy) {
			return data;
		}

		const key = orderBy.column;

		const exampleEntry = data.find(
			(item) => typeof item[key as keyof typeof item] !== 'undefined' && item[key as keyof typeof item] !== null
		);
		const exampleValue = exampleEntry ? String(exampleEntry[key as keyof typeof exampleEntry]) : '';
		const isNumber = !isNaN(exampleValue as unknown as number) && !isNaN(parseFloat(exampleValue));

		if (isNumber) {
			return data.sort((a, b) => {
				const n1 = parseFloat(String(a[key as keyof typeof a]));
				const n2 = parseFloat(String(b[key as keyof typeof b]));

				return orderBy.order === 'asc' ? n1 - n2 : n2 - n1;
			});
		} else {
			return data.sort((a, b) => {
				const s1 = String(a[key as keyof typeof a]);
				const s2 = String(b[key as keyof typeof b]);

				return orderBy.order === 'asc' ? s1.localeCompare(s2) : s2.localeCompare(s1);
			});
		}
	}
}
