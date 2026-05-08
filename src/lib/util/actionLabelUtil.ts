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
