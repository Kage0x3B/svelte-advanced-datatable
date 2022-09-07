---
title: Data Sources
---

# Data Sources

To show users a fancy datatable, you first need some data to display. But where can the datatable get this data from?
There are a couple of methods, which can be put into two main categories, client-side and server-side data.

When you store or generate the data array directly in the browser using JavaScript, the data is client-side.
On the other hand, server-side data is stored on a backend server, usually in some kind of database and is accessible using
an api endpoint.

While storing the data in the browser is easily done, it is often not an option when you have a lot of data,
need to access the same data from multiple different computers or require some kind of access protection.
That's where server-side data is more useful, as you can store massive amounts of data on the server, access it easily
from everywhere in the Internet and strictly control who can access the data.

## Client-side data with the LocalDataSource

Any data array stored in a variable in the browser can directly be used by the datatable using the `LocalDataSource`.

```typescript
const someDataArray: YourData[] = [{ id: 1, userName: "Test" }, { ... }];

const config: DataTableConfig<YourData> = {
	...additionalConfigOptions,
	dataSource: new LocalDataSource(someDataArray),
}
```

Notice that sorting the rows automatically just works without doing any configuration (numbers are automatically detected and sorted correctly).
To also enable search, the LocalDataSource needs information on which columns contain searchable text.
The `LocalDataSource` accepts options which can be passed a string array with keys of the searchable columns using the `filtering.textSearchColumns` option:

```typescript
dataSource: new LocalDataSource(someDataArray, {
	filtering: {
		textSearchColumns: ['userName']
	}
})
```

If you want to do the filtering yourself, pass a function to the `filtering.filterFunction` option with the type `(item: YourData, searchQuery: ParsedSearchQuery) => boolean`.

## Server-side data

?> To use server-side data, your backend server must implement api-endpoints which consume a [`PaginatedListRequest`](/api-reference/interfaces/PaginatedListRequest) and return a [`PaginatedListResponse`](/api-reference/interfaces/PaginatedListResponse)

### Using the Fetch-API

To request data from your backend using the [browser Fetch-API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), use the [`FetchApiDataSource`](/api-reference/classes/FetchApiDataSource):

```typescript
dataSource: new FetchApiDataSource('/api/users/list');
```

The first parameter is the api-endpoint url and the second parameter accepts [fetch options](https://developer.mozilla.org/en-US/docs/Web/API/fetch#options) passed directly onto the fetch function.

### Using a custom api function

Using the `ApiFunctionDataSource`, you can pass in a custom function to fetch the data from the backend:

```typescript
dataSource: new ApiFunctionDataSource((requestData) => fetchDataFromBackend(requestData))
```

The custom function passed into the data source receives the one parameter of the type [`PaginatedListRequest`](/api-reference/interfaces/PaginatedListRequest)
and is expected to return a Promise which either resolves to a [`PaginatedListResponse`](/api-reference/interfaces/PaginatedListResponse) or throws an error.

### Using Svelte Query

To use the Svelte Query library with your datatable, use the [`SvelteQueryDataSource`](/api-reference/classes/SvelteQueryDataSource):

```typescript
dataSource: new SvelteQueryDataSource((requestData) => fetchDataFromBackend(requestData))
```

While you can't use the `useQuery` hook directly, the `SvelteQueryDataSource` accepts a custom [`ApiFunction`](/api-reference/modules#apifunction),
similar to the `ApiFunctionDataSource`, and the options for the `useQuery` function as a second parameter.

Furthermore, you can call `setApiFunction`, `setEnabled` and `updateQueryOptions` to update any Svelte Query options and the api function.
The query key is automatically generated using the datatable type from the config and the `PaginatedListRequest` data,
with the format `["dataTable-" + type, requestData]`.
