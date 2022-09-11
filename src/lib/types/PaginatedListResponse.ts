export interface PaginatedListResponse<Data> {
	totalCount: number;

	items: Data[];
}
