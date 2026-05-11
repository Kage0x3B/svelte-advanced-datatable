---
name: svelte-advanced-datatable-data
description: Pick and wire a DataTable data source (LocalDataSource, FetchApiDataSource, ApiFunctionDataSource,
    SvelteQueryDataSource, custom AbstractDataSource/IDataSource), configure basic vs advanced search
    (BasicTextSearchParser, AdvancedSearchParser with key:value filters / #category tokens / aliases / custom query-part parsers), and surface errors via onError or the errorState snippet. Use when implementing data fetching, search parsing, server-side filtering, or error handling for the svelte-advanced-datatable package. For baseline setup, columns and layout use svelte-advanced-datatable.
---

# svelte-advanced-datatable — data sources, search, errors

The table owns the UI; the data source owns IO. Pick the implementation that matches where the data lives, wire search
through the parser of your choice, and surface failures through `onError` + the `errorState` snippet.

## 1. Pick a data source

| Where the data lives                           | Use                                                        | Import from                                        |
| :--------------------------------------------- | :--------------------------------------------------------- | :------------------------------------------------- |
| JS array already in memory (client-side)       | `LocalDataSource<T>`                                       | `svelte-advanced-datatable` (or `/dataSource`)     |
| Single REST POST returning paginated rows      | `FetchApiDataSource<T>`                                    | `svelte-advanced-datatable` (or `/dataSource`)     |
| Any bespoke async function (GraphQL, RPC, SDK) | `ApiFunctionDataSource<T>`                                 | `svelte-advanced-datatable` (or `/dataSource`)     |
| Same as above + TanStack Query caching         | `SvelteQueryDataSource<T>`                                 | `svelte-advanced-datatable/dataSource/svelteQuery` |
| Anything else (websocket, EventSource, ...)    | extend `AbstractDataSource<T>` and implement `requestData` | `svelte-advanced-datatable`                        |

The data source is passed as a separate `dataSource` prop on `<DataTable>` — never inside `config`.

## 2. The request/response contract

Every data source receives a `PaginatedListRequest<Data>` on every page/sort/search change:

```typescript
interface PaginatedListRequest<Data> {
    start: number; // offset; respect exactly
    amount: number; // page size; respect exactly
    orderBy?: { columnKey: keyof Data; direction: 'asc' | 'desc' };
    additionalOrderBy?: Array<{ columnKey: keyof Data; direction: 'asc' | 'desc' }>; // tiebreakers from Shift-click
    searchQuery?: ParsedSearchQuery; // see Search section
}

interface PaginatedListResponse<Data> {
    totalCount: number; // total after search filter, before pagination
    items: Data[]; // exactly `amount` rows (or fewer on the last page)
}
```

Server contract: respect `start`/`amount` exactly. `totalCount` is the count after filtering but before pagination — it
drives the page selector.

## 3. Per-source snippets

### LocalDataSource — in-memory arrays

```typescript
import { LocalDataSource } from 'svelte-advanced-datatable';

const dataSource = new LocalDataSource<UserData>(rows, {
    filtering: {
        textSearchColumns: ['userName', 'mailAddress'], // case-insensitive substring search
        filterFunction: (item, query) => /* keep? */ true // runs after text search
    }
});
```

`filterFunction` receives the row and the full `ParsedSearchQuery`, so it can branch on `query.searchFilters` from an
`AdvancedSearchParser`. See section 4.

### FetchApiDataSource — POST to an endpoint

```typescript
import { FetchApiDataSource } from 'svelte-advanced-datatable';

const dataSource = new FetchApiDataSource<UserData>('/api/users/list', {
    credentials: 'include',
    headers: { 'X-CSRF': csrfToken }
});
```

POSTs JSON `PaginatedListRequest`, expects `PaginatedListResponse` back. The second argument forwards to `fetch` — auth
headers, credentials, custom `signal`. In-flight requests abort automatically when the user changes page/search.

### ApiFunctionDataSource — wrap any async function

```typescript
import { ApiFunctionDataSource } from 'svelte-advanced-datatable';

const dataSource = new ApiFunctionDataSource<UserData>(async (request) => {
    const result = await usersClient.list({
        offset: request.start,
        limit: request.amount,
        sort: request.orderBy,
        q: request.searchQuery?.searchText
    });
    return { totalCount: result.total, items: result.rows };
});
```

Throw to surface an error — `onError` and `errorState` pick it up. Helper: `wrapFetchToThrow` (from root) converts
non-2xx responses into thrown `Error`s for raw `fetch`.

### SvelteQueryDataSource — TanStack caching

```typescript
import { SvelteQueryDataSource } from 'svelte-advanced-datatable/dataSource/svelteQuery';

const dataSource = new SvelteQueryDataSource<UserData>((request) => fetchUsers(request), {
    staleTime: 30_000,
    gcTime: 5 * 60_000
});
```

Query key is `["dataTable-" + config.type, request]`. Second arg forwards to `useQuery`. Runtime mutators:
`setApiFunction`, `setEnabled`, `updateQueryOptions` — swap behaviour without remounting the table.

### Custom data source

Extend `AbstractDataSource<Data>` and implement `requestData`. Implement `fetchOnce` as well if local export should
stream every page through your transport.

```typescript
import { AbstractDataSource, QueryResult } from 'svelte-advanced-datatable';
import type { PaginatedListRequest } from 'svelte-advanced-datatable';

class WebsocketDataSource<Data> extends AbstractDataSource<Data> {
    requestData(request: PaginatedListRequest<Data>): void {
        socket.send({ type: 'list', request });
        socket.onMessage = (response) => {
            this.queryResult = QueryResult.buildSuccess(response);
        };
    }
}
```

For full control over the result store, implement `IDataSource` directly.

## 4. Search

The search input feeds a parser → `ParsedSearchQuery` → the data source decides how to apply it.

### Basic text search (default)

```typescript
import { BasicTextSearchParser } from 'svelte-advanced-datatable/searchParser';

const config: DataTableConfig<UserData> = {
    // ...
    searchParser: new BasicTextSearchParser(), // implicit default; usually omitted
    enableSearch: true,
    searchDebounceMs: 200
};
```

Whole input becomes `searchText`. `LocalDataSource` checks it against `textSearchColumns`; remote sources forward it as
part of the request payload.

| Option              | Type                      | Default | Notes                                                                    |
| :------------------ | :------------------------ | :------ | :----------------------------------------------------------------------- |
| `enableSearch`      | `boolean`                 | `true`  | Show the search textbox.                                                 |
| `searchDebounceMs`  | `number`                  | `200`   | Higher = fewer requests + more input lag.                                |
| `forcedSearchQuery` | `ForcedSearchQuery<Data>` | —       | Override the user's query — permanent filters or external scope pickers. |

### Advanced search — typed filters + categories

`AdvancedSearchParser` recognises three token shapes:

- **Free text** — anything unmatched, falls into `searchText`.
- **Filters** — `key:value` tokens land in `searchFilters: { type, value }[]`.
- **Categories** — `#name` tokens land in `searchCategories` (only when `enableCategoryParsing` is on).

```typescript
import { AdvancedSearchParser } from 'svelte-advanced-datatable/searchParser';

type FilterType = 'gender' | 'test' | 'idAbove';

const searchParser = new AdvancedSearchParser<string, FilterType>({
    searchFilterAliases: {
        gender: ['g', 'sex'],
        test: ['t', 'tester', 'isTestUser'],
        idAbove: ['id', 'min']
    },
    enableCategoryParsing: false,
    additionalQueryPartParsers: []
});
```

Aliases match by `startsWith` — `g:` resolves to `gender`. Multiple definitions matching the same prefix throw a
`SearchError`.

**Custom query-part parsers** recognise bare tokens (no `key:` prefix) and turn them into filters/categories. Return
`false` to fall through.

```typescript
additionalQueryPartParsers: [
    (queryPart) =>
        queryPart.startsWith('@') ? { searchFilter: { type: 'username', value: queryPart.slice(1) } } : false
];
```

### Applying filters

**Client-side** — interpret in `filterFunction`:

```typescript
new LocalDataSource(rows, {
    filtering: {
        textSearchColumns: ['userName', 'mailAddress'],
        filterFunction: (item, query) => {
            for (const f of query.searchFilters) {
                const v = f.value.trim().toLowerCase();
                if (f.type === 'gender' && item.gender.toLowerCase() !== v) return false;
                if (f.type === 'idAbove') {
                    const min = Number.parseInt(v, 10);
                    if (Number.isFinite(min) && item.id < min) return false;
                }
            }
            return true;
        }
    }
});
```

**Server-side** — `query.searchText`, `query.searchFilters`, `query.searchCategories` are all shipped in
`PaginatedListRequest.searchQuery`. Forward them to your backend as-is.

## 5. Error handling

`onError` fires once per distinct `Error` instance — identical errors don't spam. Different identities re-fire even if
the message string matches.

```typescript
const config: DataTableConfig<UserData> = {
    // ...
    onError: (error) => toasts.push({ id: nextToastId++, message: error.message })
};
```

For in-table recovery UI, replace the default error state with the `errorState` snippet:

```svelte
<DataTable {config} {dataSource}>
    {#snippet errorState({ error })}
        <div role="alert" class="alert alert-error">
            <span>{error.message}</span>
            <button class="btn btn-sm" onclick={() => dataSource.refresh()}>Retry</button>
        </div>
    {/snippet}
</DataTable>
```

Rules:

- Throw inside `ApiFunction` to surface an error. Don't return error shapes.
- `AbortError` from in-flight aborts is filtered out — safe to throw `signal.throwIfAborted()`.
- `onError` is for cross-app surfaces (toasts, telemetry); `errorState` is for contextual recovery inside the table. Use
  both — they're independent.
- Use `wrapFetchToThrow` (from root) when wrapping raw `fetch` to convert non-2xx into thrown `Error`s.

## See also

- Data sources guide: <https://svelte-advanced-datatable.moritz.website/docs/guides/data-sources>
- Search guide: <https://svelte-advanced-datatable.moritz.website/docs/guides/search>
- Error handling guide: <https://svelte-advanced-datatable.moritz.website/docs/guides/error-handling>
- `ParsedSearchQuery`:
  <https://svelte-advanced-datatable.moritz.website/api-reference/searchParser/interfaces/ParsedSearchQuery>
