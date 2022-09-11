import type { ParsedSearchQuery } from './ParsedSearchQuery.js';
import type { SearchFilter } from '$lib/types/SearchFilter.js';
import { AbstractSearchParser } from './AbstractSearchParser.js';
import { SearchError } from './SearchError.js';

export type QueryPartParser<SearchCategory extends string = string, SearchFilterType extends string = string> = (
	queryPart: string
) => { searchCategory?: SearchCategory; searchFilter?: SearchFilter<SearchFilterType> } | false;

export type AliasMap<T extends string = string> = Record<T, string[]>;

export class AdvancedSearchParser<
	SearchCategory extends string = string,
	SearchFilterType extends string = string
> extends AbstractSearchParser<SearchCategory, SearchFilterType> {
	private readonly searchCategoryAliases: AliasMap<SearchCategory>;
	private readonly searchFilterAliases: AliasMap<SearchFilterType> = {} as AliasMap;
	private readonly additionalQueryPartParsers: QueryPartParser<SearchCategory, SearchFilterType>[] = [];

	constructor(options?: {
		searchCategoryAliases?: AliasMap<SearchCategory>;
		searchFilterAliases?: AliasMap;
		additionalQueryPartParsers: QueryPartParser<SearchCategory, SearchFilterType>[];
	}) {
		super();

		this.searchCategoryAliases = options?.searchCategoryAliases ?? ({} as AliasMap<SearchCategory>);
		this.searchFilterAliases = options?.searchFilterAliases ?? ({} as AliasMap);
		this.additionalQueryPartParsers = options?.additionalQueryPartParsers ?? [];
	}

	parseSearchQuery(rawSearchQuery: string): ParsedSearchQuery<SearchCategory, SearchFilterType> | undefined {
		const queryParts = this.splitQueryParts(this.cleanQuery(rawSearchQuery));

		if (!queryParts.length) {
			return undefined;
		}

		const searchText: string[] = [];
		const searchCategories: SearchCategory[] = [];
		const searchFilters: SearchFilter<SearchFilterType>[] = [];
		let forceGlobalSearch = false;

		for (let queryPart of queryParts) {
			if (queryPart.startsWith('#')) {
				queryPart = queryPart.substring(1);

				if (queryPart === '#') {
					forceGlobalSearch = true;
				} else {
					searchCategories.push(this.matchPartialAlias(this.searchCategoryAliases, queryPart));
				}
			} else if (queryPart.indexOf(':') !== -1) {
				const filterName = queryPart.substring(0, queryPart.indexOf(':'));
				const filterArgs = queryPart.substring(queryPart.indexOf(':') + 1);

				if (!filterName.length) {
					throw new SearchError('search.error.emptyFilterName', queryPart);
				}

				const filterType = this.matchPartialAlias(this.searchFilterAliases, filterName);
				searchFilters.push({
					type: filterType,
					value: filterArgs
				});
			} else {
				let parsedQueryPart: ReturnType<QueryPartParser<SearchCategory, SearchFilterType>> = false;

				for (const queryPartParser of this.additionalQueryPartParsers) {
					parsedQueryPart = queryPartParser(queryPart);

					if (parsedQueryPart) {
						break;
					}
				}

				if (parsedQueryPart) {
					if (parsedQueryPart.searchFilter) {
						searchFilters.push(parsedQueryPart.searchFilter);
					}
					if (parsedQueryPart.searchCategory) {
						searchCategories.push(parsedQueryPart.searchCategory);
					}
				} else {
					searchText.push(queryPart);
				}
			}
		}

		return {
			searchText: searchText.join(' '),
			searchCategories,
			searchFilters,
			forceGlobalSearch
		};
	}

	private matchPartialAlias<T extends string>(aliasMap: AliasMap<T>, text: string): T {
		let match: T | null = null;

		for (const key of Object.keys(aliasMap) as T[]) {
			for (const alias of [key, ...aliasMap[key]]) {
				if (alias.startsWith(text)) {
					if (match && match !== key) {
						throw new SearchError('search.error.unspecificAlias', match, alias);
					}

					match = key;
				}
			}
		}

		if (!match) {
			// throw new SearchError('search.error.unknownSpecifier', text);
		}

		return match ?? (text as T);
	}
}
