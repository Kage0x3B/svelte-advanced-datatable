import type { ContextMenuState } from '$lib/internal/contextMenuState.svelte.js';
import type { IDataSource } from '$lib/dataSource/IDataSource.js';
import type { RowFocusState } from '$lib/internal/rowFocusState.svelte.js';
import type { SelectionState } from '$lib/internal/selectionState.svelte.js';
import type { MessageFormatter } from '$lib/types/MessageFormatter.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { ActionInvocation } from '$lib/util/invokeAction.js';
import type { DataTableAction } from '$lib/types/DataTableAction.js';
import { Context } from 'runed';
import type { ReadableBox } from 'svelte-toolbelt';

export const configContext = new Context<ReadableBox<FullDataTableConfig<unknown>>>('DATATABLE_CONFIG_CONTEXT_KEY');

export const dataSourceContext = new Context<ReadableBox<IDataSource<unknown>>>('DATATABLE_DATA_SOURCE_CONTEXT_KEY');

export const messageFormatterContext = new Context<ReadableBox<MessageFormatter>>(
    'DATATABLE_MESSAGE_FORMATTER_CONTEXT_KEY'
);

/**
 * Reactive selection state shared with the row checkbox cells, header
 * checkbox, row-action dropdown, and bulk-action toolbar. Always set when the
 * dataTable mounts — selection itself is feature-gated (config.actions /
 * selection.enabled / a bound `selectedIds` prop), the state is just dormant
 * when nothing's selected.
 */
export const selectionContext = new Context<ReadableBox<SelectionState<unknown>>>(
    'DATATABLE_SELECTION_CONTEXT_KEY'
);

/**
 * Reactive flag describing whether the selection UI (checkbox column, row
 * actions column, bulk toolbar) should render. Decoupled from the selection
 * state itself so consumers binding `selectedIds` for a fully custom UI can
 * leave the built-in chrome off.
 */
export const selectionEnabledContext = new Context<ReadableBox<boolean>>('DATATABLE_SELECTION_ENABLED_CONTEXT_KEY');

/**
 * Reactive flag describing whether the trailing per-row actions column
 * (three-dot menu) should render. Independent from `selectionEnabled`
 * because a consumer might enable selection without registering any
 * row-context actions.
 */
export const rowActionsColumnEnabledContext = new Context<ReadableBox<boolean>>(
    'DATATABLE_ROW_ACTIONS_COLUMN_ENABLED_CONTEXT_KEY'
);

/**
 * Action runner exposed to row-action cells and the bulk-action toolbar. The
 * dataTable component pre-binds the refresh callback (its access to the
 * data source) and the selection state, so callers only have to pass the
 * action being invoked plus an invocation describing single-row vs bulk.
 */
export interface ActionRunner {
    invoke<Data>(action: DataTableAction<Data>, invocation: ActionInvocation<Data>): Promise<void>;
}

export const actionRunnerContext = new Context<ReadableBox<ActionRunner>>('DATATABLE_ACTION_RUNNER_CONTEXT_KEY');

/**
 * Reactive row-focus state used by the keyboard-navigation layer. Drives
 * the roving-tabindex pattern: exactly one row index has `tabindex=0` at a
 * time, the rest have `tabindex=-1`. Always set when the dataTable mounts
 * — only consulted when the table or one of its rows is focused.
 */
export const rowFocusContext = new Context<ReadableBox<RowFocusState>>('DATATABLE_ROW_FOCUS_CONTEXT_KEY');

/**
 * Reactive context-menu state shared between rows (which open the menu via
 * right-click / long-press) and the single `DaisyUiContextMenu` component
 * mounted at the table root. Always set when the dataTable mounts —
 * dormant unless the user opens the menu.
 */
export const contextMenuContext = new Context<ReadableBox<ContextMenuState<unknown>>>(
    'DATATABLE_CONTEXT_MENU_CONTEXT_KEY'
);
