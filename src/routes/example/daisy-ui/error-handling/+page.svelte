<script lang="ts">
    import { ComponentType } from '$lib/dataComponent/ComponentType.js';
    import type { EnumComponentTypeProperties } from '$lib/dataComponent/EnumComponentTypeProperties.js';
    import { ApiFunctionDataSource } from '$lib/dataSource/ApiFunctionDataSource.svelte.js';
    import { DataTable } from '$lib/daisyUi/index.js';
    import type { DataTableConfig } from '$lib/types/DataTableConfig.js';
    import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
    import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';
    import { exampleUserList, type UserData } from '../../util/UserData.js';

    interface Toast {
        id: number;
        message: string;
    }

    let nextToastId = 0;
    let toasts = $state<Toast[]>([]);

    let failureRate = $state(0.4);
    let manualFailNext = $state(false);

    function pushToast(message: string) {
        const toast = { id: nextToastId++, message };
        toasts = [...toasts, toast];
        setTimeout(() => {
            toasts = toasts.filter((t) => t.id !== toast.id);
        }, 4000);
    }

    function flakyDelay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function fetchPage(request: PaginatedListRequest<UserData>): Promise<PaginatedListResponse<UserData>> {
        await flakyDelay(400);

        if (manualFailNext) {
            manualFailNext = false;
            throw new Error("Manual failure: you pressed the 'fail next' button.");
        }

        if (Math.random() < failureRate) {
            const reasons = [
                'Upstream timeout (504)',
                'Database connection refused',
                'Rate limit exceeded',
                'Service unavailable (503)'
            ];
            throw new Error(reasons[Math.floor(Math.random() * reasons.length)]);
        }

        const start = request.start ?? 0;
        const amount = request.amount ?? 10;
        let items = exampleUserList;

        const text = request.searchQuery?.searchText?.trim().toLowerCase();
        if (text) {
            items = items.filter(
                (user) =>
                    user.userName.toLowerCase().includes(text) ||
                    user.firstName.toLowerCase().includes(text) ||
                    user.lastName.toLowerCase().includes(text)
            );
        }

        return {
            totalCount: items.length,
            items: items.slice(start, start + amount)
        };
    }

    const dataSource = new ApiFunctionDataSource<UserData>(fetchPage);

    const config: DataTableConfig<UserData> = {
        type: 'flakyUsers',
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
            } as EnumComponentTypeProperties<'male' | 'female'>
        },
        dataUniquePropertyKey: 'id',
        messageConfig: {
            id: { label: 'Id' },
            userName: { label: 'Username' },
            firstName: { label: 'First Name' },
            lastName: { label: 'Last Name' },
            mailAddress: { label: 'E-Mail' },
            gender: {
                label: 'Gender',
                enumValue: { male: 'Male', female: 'Female' }
            }
        },
        onError: (error) => pushToast(error.message)
    };

    function retry() {
        dataSource.requestData({ start: 0, amount: 50 });
    }
</script>

<div class="mb-6 flex flex-col gap-3">
    <div>
        <h1 class="text-2xl font-bold">Error handling with the <code>onError</code> callback</h1>
        <p class="text-base-content/70">
            This page wires the <code>config.onError</code> hook to a toast notifier. Every fresh failure of the data
            source bubbles up through the callback so you can show feedback, log to telemetry or trigger a retry —
            without having to subscribe to <code>queryResult</code> manually.
        </p>
    </div>

    <div class="rounded-box bg-base-200 flex flex-wrap items-center gap-4 p-4">
        <label class="flex items-center gap-2 text-sm">
            Failure rate
            <input type="range" min="0" max="1" step="0.05" bind:value={failureRate} class="range range-sm w-48" />
            <span class="font-mono">{Math.round(failureRate * 100)}%</span>
        </label>
        <button
            class="btn btn-warning btn-sm"
            onclick={() => {
                manualFailNext = true;
                retry();
            }}
        >
            Fail the next request
        </button>
        <button class="btn btn-primary btn-sm" onclick={retry}>Retry</button>
    </div>
</div>

<DataTable {config} {dataSource} hoverable />

<div class="toast toast-top toast-end z-50">
    {#each toasts as toast (toast.id)}
        <div class="alert alert-error shadow-lg">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
            <span>{toast.message}</span>
        </div>
    {/each}
</div>
