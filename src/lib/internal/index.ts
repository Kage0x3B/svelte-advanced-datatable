import { default as Column } from './InternalDataColumn.svelte';
import { default as Row } from './InternalDataRow.svelte';
import { default as InternalDataTable } from './InternalDataTable.svelte';
import { default as Pagination } from './InternalDataTablePagination.svelte';
import { default as SearchField } from './InternalSearchField.svelte';

export default {
    Column,
    Row,
    Root: InternalDataTable,
    Pagination,
    SearchField
};
