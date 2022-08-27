import type { SearchFilter } from './SearchFilter.js';

export interface ParsedSearchQuery<SearchCategory extends string = string, SearchFilterType extends string = string> {
	/**
	 * Any text to search for in each item
	 */
	searchText: string;

	/**
	 * A list of categories to include items from
	 */
	searchCategories: SearchCategory[];

	/**
	 * A list of filters, which each have a type and a value, to filter the resulting items with
	 */
	searchFilters: SearchFilter<SearchFilterType>[];

	/**
	 * If a global search box is used, this can reset back to full global search, instead of inferring a category from for example a currently shown datatable
	 */
	forceGlobalSearch: boolean;
}
