import type { Component } from 'svelte';
import type { SelectionId } from './SelectionId.js';

/**
 * Visual styling variant for an action — maps to DaisyUI button/menu colour
 * classes inside the action UI components. `default` keeps the inherited menu
 * styling, `primary` adds emphasis (e.g. a blue button), and `destructive`
 * marks dangerous operations (e.g. a red delete button).
 */
export type DataTableActionVariant = 'default' | 'primary' | 'destructive';

/**
 * Context passed to {@link DataTableAction.isDisabled}. Mirrors the row vs
 * bulk dispatch split so a single predicate can express both
 * "can't delete this archived item" and "can't delete more than 100 at once".
 *
 * Bulk invocations only include rows that are currently loaded into memory
 * via `loadedItems` — cross-page selections may include extra `ids` for rows
 * the consumer hasn't fetched yet.
 */
export type ActionDisabledContext<Data = unknown> =
    | { kind: 'row'; item: Data }
    | { kind: 'bulk'; ids: SelectionId[]; loadedItems: Data[] };

/**
 * A registered action invokable from the row dropdown (single-item context),
 * the bulk selection toolbar (multi-item context), or both.
 *
 * Exactly one of {@link onSingle} or {@link onMulti} must be provided. When
 * only `onMulti` is supplied, single-row invocations call it with `[id]` —
 * letting one handler cover both contexts.
 */
export interface DataTableAction<Data = unknown> {
    /**
     * Stable identifier. Used as a React-style key in rendered lists and as
     * the lookup key for the action's translated label (resolved through the
     * configured {@link MessageFormatter}).
     */
    key: string;

    /**
     * Optional Svelte icon component shown next to the label. Receives no
     * props — render an SVG sized via tailwind classes (e.g. `class="size-4"`).
     */
    icon?: Component;

    /**
     * Visual variant. Defaults to `'default'`.
     */
    variant?: DataTableActionVariant;

    /**
     * If `true`, the action renders as a standalone button in the bulk
     * selection toolbar. Non-primary actions live inside the "More actions"
     * dropdown. Capped by `selection.primaryActionsCount`.
     */
    primary?: boolean;

    /**
     * Hide the action from the per-row dropdown. Defaults to `false`.
     */
    hideInRow?: boolean;

    /**
     * Hide the action from the bulk selection toolbar. Defaults to `false`.
     * Implicitly hidden when no `onMulti` handler is provided.
     */
    hideInBulk?: boolean;

    /**
     * Per-row visibility predicate evaluated for the row dropdown only.
     * Return `false` to hide the action for that row (e.g. lock the
     * "Promote" action behind a permission flag).
     */
    rowVisible?: (item: Data) => boolean;

    /**
     * Override label for the bulk-toolbar context. Lets a single action
     * read "Delete" in the per-row dropdown but "Delete 5 users" in the
     * toolbar without wiring two labels through the formatter.
     *
     * - **string**: substituted via `{count}` interpolation.
     *   `'Delete {count} users'` → `'Delete 5 users'`.
     * - **function**: called with the current selection count and returns
     *   the rendered label — the right tool for ICU-style pluralisation.
     *
     * Resolution order (when both this field and a translation entry
     * exist): `function` → message-formatter `actions.<key>.bulkLabel` →
     * `string` → fallback to the regular per-action label. Has no effect
     * outside the bulk toolbar.
     */
    bulkLabel?: string | ((count: number) => string);

    /**
     * Optional grouping key. Actions sharing a `group` render together in
     * dropdown menus (row dropdown + bulk overflow), separated from other
     * groups by a `<li class="menu-title">` header. Ungrouped actions come
     * first; groups follow in first-occurrence order so the consumer's
     * array order is preserved.
     *
     * The header label resolves through the message formatter via
     * `actions.groups.<group>`, falling back to the raw group string —
     * mirroring the lookup convention used by per-action labels.
     *
     * Has no effect on the bulk toolbar's primary buttons (those keep flat
     * order regardless of grouping).
     */
    group?: string;

    /**
     * Single-item handler. Used when the action is invoked from a row's
     * three-dot dropdown and an `onSingle` is defined. Receives the full row
     * object so the handler can read any property without a refetch.
     */
    onSingle?: (item: Data) => void | Promise<void>;

    /**
     * Multi-item handler. Used when the action is invoked from the bulk
     * selection toolbar, and as a fallback for the row dropdown when
     * `onSingle` is not provided (called with `[id]`).
     *
     * Receives only IDs because cross-page selections may include rows that
     * are not currently loaded into memory. Refetch with the IDs if the
     * handler needs the full objects.
     */
    onMulti?: (ids: SelectionId[]) => void | Promise<void>;

    /**
     * Predicate evaluated for every render. Return a string to disable the
     * action and surface that string as the button's `title` (and as
     * accessible text for screen readers). Return `false` to keep the action
     * enabled — that's the default when the field is omitted.
     *
     * Receives an {@link ActionDisabledContext} so the same predicate can
     * cover both row-context (single `item`) and bulk-context (selection
     * `ids` plus the subset of `loadedItems` currently in memory).
     */
    isDisabled?: (context: ActionDisabledContext<Data>) => string | false;

    /**
     * Keyboard shortcut bound while the table or one of its rows holds
     * focus. The string is parsed as `+`-separated tokens with the last
     * token being the key. Modifiers: `Shift`, `Alt` / `Option`, `Ctrl` /
     * `Control`, `Cmd` / `Meta` / `Super`, and `Mod` (auto-resolves to
     * `Cmd` on macOS and `Ctrl` everywhere else).
     *
     * Examples: `'Delete'`, `'Mod+E'`, `'Shift+Mod+D'`, `'/'`.
     *
     * Dispatch mirrors right-click: a multi-row selection fires the
     * action's `onMulti`, otherwise the focused row is treated as a
     * single-row invocation. Disabled actions (per {@link isDisabled})
     * silently swallow the shortcut. Conflicts between two actions are
     * resolved by `config.actions` order — first match wins.
     *
     * Shortcuts never fire while a text-entry widget inside a cell is
     * focused (input / textarea / select / contenteditable).
     */
    shortcut?: string;

    /**
     * Whether to call `dataSource.refresh()` after the handler resolves.
     * Defaults to `true` — the common case is a mutation that needs to
     * re-render the table.
     */
    refreshAfter?: boolean;

    /**
     * Whether to clear the current selection after the handler resolves.
     * Defaults to `true` for bulk invocations and `false` for single-row
     * invocations.
     */
    clearSelectionAfter?: boolean;
}
