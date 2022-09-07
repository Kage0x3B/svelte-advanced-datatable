import type { ParsedSearchQuery } from '../searchParser/index.js';
import type { DataRecord } from '../types/DataRecord.js';
import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';
import { AbstractDataSource } from './AbstractDataSource.js';

export interface LocalDataSourceOptions<T extends DataRecord> {
	filtering?: {
		textSearchColumns?: (keyof T)[];
		filterFunction?: (item: T, searchQuery: ParsedSearchQuery) => boolean;
	};
}

/**
 * The local data source requires the data to be passed in as an array.
 * The datatable is still paginated, sorted and searchable by performing everything on the clientside
 */
export class LocalDataSource<T extends DataRecord = DataRecord> extends AbstractDataSource<T> {
	/**
	 * Create a new local data source to use the passed in array as data.
	 *
	 * @param data array with all table entries
	 * @param options
	 */
	constructor(private data: T[], private options: LocalDataSourceOptions<T> = {}) {
		super();
	}

	public requestData(data: PaginatedListRequest<T>): void {
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

	private filterData<T extends DataRecord>({
		data,
		searchQuery
	}: {
		data: T[];
		searchQuery: PaginatedListRequest<T>['searchQuery'] | undefined;
	}): T[] {
		if (!searchQuery) {
			return data;
		}

		if (this.options.filtering?.textSearchColumns?.length && searchQuery.searchText?.trim()) {
			data = data.filter((item) => {
				for (const columnKey of this.options!.filtering!.textSearchColumns!) {
					if (
						String(item[columnKey as string])
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

	private sortData<T extends DataRecord>({
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

		const exampleEntry = data.find((item) => typeof item[key] !== 'undefined' && item[key] !== null);
		const exampleValue = exampleEntry ? String(exampleEntry[key]) : '';
		const isNumber = !isNaN(exampleValue as unknown as number) && !isNaN(parseFloat(exampleValue));

		if (isNumber) {
			return data.sort((a, b) => {
				const n1 = parseFloat(String(a[key]));
				const n2 = parseFloat(String(b[key]));

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
}
