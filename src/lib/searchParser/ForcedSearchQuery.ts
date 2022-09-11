import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';

export type ForcedSearchQuery<Data> = Partial<Pick<PaginatedListRequest<Data>, 'searchQuery' | 'orderBy'>>;
