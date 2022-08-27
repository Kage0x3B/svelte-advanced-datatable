export interface SearchFilter<SearchFilterType extends string = string> {
	type: SearchFilterType;
	value: string;
}
