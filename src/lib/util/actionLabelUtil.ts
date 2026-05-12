import type { DataTableAction } from '$lib/types/DataTableAction.js';
import type { FullDataTableConfig } from '$lib/types/DataTableConfig.js';
import type { InterpolationValues, MessageFormatter } from '$lib/types/MessageFormatter.js';

/**
 * Sentinel returned by `format()` when neither the object-form lookup
 * (`actions.${key}.label`) nor the bare-string lookup (`actions.${key}`)
 * resolves. Picked to be unrealistic enough that no real translation could
 * collide with it.
 */
const MISSING_ACTION_LABEL = '__DT_MISSING_ACTION_LABEL__';

/**
 * Resolve an action label (or an action-related chrome label like
 * `selectedCount`) through the configured message formatter.
 *
 * Two storage shapes are accepted, mirroring the convention used elsewhere
 * in `messageConfig`:
 *
 * - **bare string** — `messageConfig.actions.delete = 'Delete'`. The terse
 *   form, recommended for action labels with no per-language interpolation
 *   needs.
 * - **object** — `messageConfig.actions.delete = { label: 'Delete' }`. The
 *   canonical form that matches the per-column `messageConfig` shape and
 *   leaves room for future fields without a breaking change.
 *
 * The object form is tried first; if that resolves, its `.label` value is
 * returned. Otherwise the bare-string form is consulted, falling through to
 * the supplied default.
 */
export function resolveActionLabel(
    _config: FullDataTableConfig<unknown>,
    format: MessageFormatter,
    actionKey: string,
    fallback: string,
    values?: InterpolationValues
): string {
    const objectForm = format(`actions.${actionKey}.label`, {
        default: MISSING_ACTION_LABEL,
        values
    });
    if (objectForm !== undefined && objectForm !== MISSING_ACTION_LABEL) return objectForm;

    const stringForm = format(`actions.${actionKey}`, { default: fallback, values });
    return stringForm ?? fallback;
}

/**
 * One section in a grouped action menu — `null` label means the bucket has
 * no header (the ungrouped actions). Non-null labels render as a
 * `<li class="menu-title">` heading above the section's items.
 */
export interface ActionGroupSection<Data> {
    label: string | null;
    actions: DataTableAction<Data>[];
}

/**
 * Bucket the supplied actions by their optional `group` field for rendering
 * in a dropdown. Ungrouped actions always come first (no header). Groups
 * follow in **first-occurrence order** so the consumer's array order is
 * preserved end-to-end — adding a new action to an existing group never
 * reshuffles the menu.
 *
 * Group headers are resolved through the supplied formatter via
 * `actions.groups.<group>`, falling back to the raw group string. That
 * mirrors the convention used by `resolveActionLabel` for action keys.
 */
export function groupActions<Data>(
    actions: readonly DataTableAction<Data>[],
    format: MessageFormatter
): ActionGroupSection<Data>[] {
    const ungrouped: DataTableAction<Data>[] = [];
    const groups = new Map<string, DataTableAction<Data>[]>();

    for (const action of actions) {
        if (!action.group) {
            ungrouped.push(action);
            continue;
        }
        let bucket = groups.get(action.group);
        if (!bucket) {
            bucket = [];
            groups.set(action.group, bucket);
        }
        bucket.push(action);
    }

    const sections: ActionGroupSection<Data>[] = [];
    if (ungrouped.length > 0) sections.push({ label: null, actions: ungrouped });
    for (const [groupKey, bucket] of groups) {
        const label = format(`actions.groups.${groupKey}`, { default: groupKey }) ?? groupKey;
        sections.push({ label, actions: bucket });
    }
    return sections;
}
