<script lang="ts">
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
    import { LocalDataSource } from '$lib/dataSource/LocalDataSource.svelte.js';
    import { DataTable } from '$lib/daisyUi/index.js';
    import { AdvancedSearchParser } from '$lib/searchParser/AdvancedSearchParser.js';
    import type { ParsedSearchQuery } from '$lib/searchParser/ParsedSearchQuery.js';
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import { exampleUserList, type UserData } from '../../util/UserData.js';

    type FilterType = 'gender' | 'test' | 'idAbove';

    const searchParser = new AdvancedSearchParser<string, FilterType>({
        // Allow the user to type either the canonical name or any alias.
        searchFilterAliases: {
            gender: ['g', 'sex'],
            test: ['t', 'tester', 'isTestUser'],
            idAbove: ['id', 'min']
        },
        additionalQueryPartParsers: [],
        enableCategoryParsing: false
    });

    function matchesFilters(item: UserData, query: ParsedSearchQuery): boolean {
        for (const filter of query.searchFilters) {
            const value = filter.value.trim().toLowerCase();
            switch (filter.type as FilterType) {
                case 'gender':
                    if (item.gender.toLowerCase() !== value) return false;
                    break;
                case 'test': {
                    const expected = value === 'true' || value === 'yes' || value === '1';
                    if (item.isTestUser !== expected) return false;
                    break;
                }
                case 'idAbove': {
                    const min = Number.parseInt(value, 10);
                    if (Number.isFinite(min) && item.id < min) return false;
                    break;
                }
                default:
                    return false;
            }
        }
        return true;
    }

    const dataSource = new LocalDataSource(exampleUserList, {
        filtering: {
            textSearchColumns: ['userName', 'firstName', 'lastName', 'mailAddress'],
            filterFunction: matchesFilters
        }
    });

    const config: DataTableConfig<UserData> = {
        type: 'advancedSearchUsers',
        columnProperties: {
            id: { type: ComponentType.NUMBER },
            userName: { type: ComponentType.STRING },
            firstName: { type: ComponentType.STRING },
            lastName: { type: ComponentType.STRING },
            mailAddress: { type: ComponentType.STRING },
            gender: {
                type: ComponentType.ENUM,
                values: ['male', 'female'],
                enumColorKey: {
                    male: 'blue',
                    female: 'red',
                    default: 'gray',
                    unknown: 'gray'
                }
            } as EnumComponentTypeProperties<'male' | 'female'>,
            isTestUser: { type: ComponentType.BOOLEAN }
        },
        dataUniquePropertyKey: 'id',
        searchParser,
        searchDebounceMs: 350,
        messageConfig: {
            id: { label: 'Id' },
            userName: { label: 'Username' },
            firstName: { label: 'First Name' },
            lastName: { label: 'Last Name' },
            mailAddress: { label: 'E-Mail' },
            gender: {
                label: 'Gender',
                enumValue: { male: 'Male', female: 'Female' }
            },
            isTestUser: { label: 'Test User' },
            search: {
                placeholder: 'free text or gender:male  test:true  id:50',
                ariaLabel: 'Advanced search query'
            }
        }
    };

    const examples = [
        { query: 'gender:female', label: 'gender:female' },
        { query: 't:true', label: 't:true (alias for isTestUser)' },
        { query: 'id:100 gender:male', label: 'id:100 gender:male' },
        { query: 'gmail gender:female', label: 'free-text + filter' }
    ];
</script>

<div class="mb-6 flex flex-col gap-3">
    <div>
        <h1 class="text-2xl font-bold">Filter syntax with <code>AdvancedSearchParser</code></h1>
        <p class="text-base-content/70">
            The default <code>BasicTextSearchParser</code> only does free-text search. Switching to
            <code>AdvancedSearchParser</code> teaches the search box about <code>key:value</code> filters — and the
            local data source's <code>filterFunction</code> turns those filters into real predicates. Aliases in the
            parser config let users type <code>g:male</code>, <code>sex:male</code> or <code>gender:male</code>
            interchangeably.
        </p>
    </div>

    <div class="rounded-box bg-base-200 p-4">
        <div class="mb-2 text-sm font-semibold">Try one of these:</div>
        <div class="flex flex-wrap gap-2">
            {#each examples as example (example.query)}
                <code class="bg-base-100 rounded px-2 py-1 text-xs">{example.label}</code>
            {/each}
        </div>
        <ul class="text-base-content/70 mt-3 list-inside list-disc text-sm">
            <li>Free text matches against username / name / email</li>
            <li>
                Filters: <code>gender:</code>, <code>test:</code>, <code>id:</code> (minimum id) — with aliases
            </li>
            <li>
                Debounce is set to 350 ms so the parser doesn't run on every keystroke
            </li>
        </ul>
    </div>
</div>

<DataTable {config} {dataSource} hoverable striped />
