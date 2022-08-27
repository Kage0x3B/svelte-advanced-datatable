import type { ParsedSearchQuery } from '../types/ParsedSearchQuery.js';

export interface ISearchParser<SearchCategory extends string = string, SearchFilterType extends string = string> {
	/**
	 * Parses the raw search query text into the search text and possibly search filters and categories
	 * @param rawSearchQuery the raw search query text to parse
	 */
	parseSearchQuery(rawSearchQuery: string): ParsedSearchQuery<SearchCategory, SearchFilterType> | undefined;
}
