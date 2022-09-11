import type { PaginatedListRequest } from './PaginatedListRequest.js';
import type { PaginatedListResponse } from './PaginatedListResponse.js';

export type ApiFunction<Data> = (request: PaginatedListRequest<Data>) => Promise<PaginatedListResponse<Data>>;
