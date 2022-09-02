import type { ParsedSearchQuery } from './ParsedSearchQuery.js';
import { AbstractSearchParser } from './AbstractSearchParser.js';

export class BasicTextSearchParser extends AbstractSearchParser {
	parseSearchQuery(rawSearchQuery: string): ParsedSearchQuery {
		return {
			searchText: this.cleanQuery(rawSearchQuery),
			searchCategories: [],
			searchFilters: [],
			forceGlobalSearch: false
		};
	}
}
