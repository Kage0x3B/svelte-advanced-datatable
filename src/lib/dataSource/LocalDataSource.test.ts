import { describe, expect, it } from 'vitest';
import { LocalDataSource } from './LocalDataSource.svelte.js';

interface Row {
    id: number;
    name: string;
    age: number;
}

const sampleRows = (): Row[] => [
    { id: 1, name: 'Charlie', age: 30 },
    { id: 2, name: 'Alice', age: 25 },
    { id: 3, name: 'Bob', age: 40 }
];

describe('LocalDataSource', () => {
    it('returns the requested page slice', () => {
        const data = sampleRows();
        const source = new LocalDataSource<Row>(data);

        source.requestData({ start: 0, amount: 2 });

        expect(source.queryResult.data).toEqual({
            totalCount: 3,
            items: [
                { id: 1, name: 'Charlie', age: 30 },
                { id: 2, name: 'Alice', age: 25 }
            ]
        });
    });

    it('does not mutate the source array when sorting', () => {
        const data = sampleRows();
        const originalOrder = data.map((r) => r.id);
        const source = new LocalDataSource<Row>(data);

        source.requestData({
            start: 0,
            amount: 10,
            orderBy: { column: 'name', order: 'asc' }
        });

        expect(data.map((r) => r.id)).toEqual(originalOrder);
    });

    it('sorts strings ascending without mutating the input', () => {
        const data = sampleRows();
        const source = new LocalDataSource<Row>(data);

        source.requestData({
            start: 0,
            amount: 10,
            orderBy: { column: 'name', order: 'asc' }
        });

        expect(source.queryResult.data?.items.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie']);
        expect(data.map((r) => r.name)).toEqual(['Charlie', 'Alice', 'Bob']);
    });

    it('sorts numbers descending', () => {
        const data = sampleRows();
        const source = new LocalDataSource<Row>(data);

        source.requestData({
            start: 0,
            amount: 10,
            orderBy: { column: 'age', order: 'desc' }
        });

        expect(source.queryResult.data?.items.map((r) => r.age)).toEqual([40, 30, 25]);
    });

    it('filters via textSearchColumns', () => {
        const data = sampleRows();
        const source = new LocalDataSource<Row>(data, {
            filtering: { textSearchColumns: ['name'] }
        });

        source.requestData({
            start: 0,
            amount: 10,
            searchQuery: {
                searchText: 'al',
                searchCategories: [],
                searchFilters: [],
                forceGlobalSearch: false
            }
        });

        expect(source.queryResult.data?.items.map((r) => r.name)).toEqual(['Alice']);
        expect(source.queryResult.data?.totalCount).toBe(1);
    });

    it('filters via custom filterFunction', () => {
        const data = sampleRows();
        const source = new LocalDataSource<Row>(data, {
            filtering: { filterFunction: (item) => item.age >= 30 }
        });

        source.requestData({
            start: 0,
            amount: 10,
            searchQuery: {
                searchText: '',
                searchCategories: [],
                searchFilters: [],
                forceGlobalSearch: false
            }
        });

        expect(source.queryResult.data?.items.map((r) => r.id).sort()).toEqual([1, 3]);
        expect(source.queryResult.data?.totalCount).toBe(2);
    });

    it('repeated calls return consistent results (no compounding state)', () => {
        const data = sampleRows();
        const source = new LocalDataSource<Row>(data);

        source.requestData({ start: 0, amount: 10, orderBy: { column: 'name', order: 'asc' } });
        const first = source.queryResult.data?.items.map((r) => r.name);

        source.requestData({ start: 0, amount: 10, orderBy: { column: 'age', order: 'desc' } });
        source.requestData({ start: 0, amount: 10, orderBy: { column: 'name', order: 'asc' } });
        const second = source.queryResult.data?.items.map((r) => r.name);

        expect(second).toEqual(first);
    });

    it('applies additionalOrderBy as a tiebreaker after the primary sort', () => {
        // Two rows share an age of 30 — only the secondary `name` sort
        // determines their relative order. Without the tiebreaker the
        // result would be unstable.
        const data: Row[] = [
            { id: 1, name: 'Charlie', age: 30 },
            { id: 2, name: 'Alice', age: 25 },
            { id: 3, name: 'Bob', age: 30 }
        ];
        const source = new LocalDataSource<Row>(data);

        source.requestData({
            start: 0,
            amount: 10,
            orderBy: { column: 'age', order: 'desc' },
            additionalOrderBy: [{ column: 'name', order: 'asc' }]
        });

        // age desc: 30s first (Bob, Charlie alphabetically asc), then 25 (Alice).
        expect(source.queryResult.data?.items.map((r) => r.name)).toEqual(['Bob', 'Charlie', 'Alice']);
    });
});
