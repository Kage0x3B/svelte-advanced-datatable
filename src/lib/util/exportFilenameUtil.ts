import { DateTime } from 'luxon';

/**
 * Build a download filename of the form
 * `{sanitizedType}_{yyyy-LL-dd_HH-mm-ss}.{extension}`. Falls back to `'export'`
 * for the type segment when sanitization removes everything (defensive — the
 * `DataTableConfig.type` jsdoc already forbids unsafe characters).
 */
export function buildExportFilename(tableType: string, extension: string, now: DateTime = DateTime.now()): string {
    const segment = sanitizeFilenameSegment(tableType);
    const stamp = now.toFormat('yyyy-LL-dd_HH-mm-ss');
    return `${segment}_${stamp}.${extension}`;
}

/**
 * Replace anything outside `[A-Za-z0-9_\-.]` with `_` and cap the segment at
 * 80 characters so filename + timestamp + extension stays well below
 * Windows MAX_PATH limits even when nested in deep download folders.
 */
export function sanitizeFilenameSegment(input: string): string {
    const cleaned = input.replace(/[^A-Za-z0-9_\-.]/g, '_').slice(0, 80);
    return cleaned.length > 0 ? cleaned : 'export';
}
