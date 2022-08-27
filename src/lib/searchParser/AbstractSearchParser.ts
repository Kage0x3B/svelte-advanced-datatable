import type { ParsedSearchQuery } from '../types/ParsedSearchQuery.js';
import type { ISearchParser } from './ISearchParser.js';

export abstract class AbstractSearchParser<SearchCategory extends string = string, SFT extends string = string>
	implements ISearchParser<SearchCategory, SFT>
{
	public abstract parseSearchQuery(rawSearchQuery: string): ParsedSearchQuery<SearchCategory, SFT> | undefined;

	/**
	 * Cleans the query by trimming, lowercasing the string and then removing all
	 * @param query
	 * @protected
	 */
	protected cleanQuery(query: string): string {
		query = query.replace(/\s+/g, ' ').trim();

		return query.toLowerCase();
	}

	/**
	 * Splits the raw query into parts/words separated by spaces. Quotation marks can be used to group multiple words into one query part.
	 * @param query
	 * @protected
	 */
	protected splitQueryParts(query: string): string[] {
		const queryParts = query.match(/"[^"]*"|[^\s"]+/g);

		if (!queryParts) {
			return [];
		}

		return queryParts.map((p) =>
			p.substring(p.startsWith('"') ? 1 : 0, p.endsWith('"') ? p.length - 1 : p.length)
		) as string[];
	}
}
