import type { PaginatedListRequest } from '../types/PaginatedListRequest.js';

export type ForcedSearchQuery<Data> = Partial<Pick<PaginatedListRequest<Data>, 'searchQuery' | 'orderBy'>>;
