import type { ExportResult, ResolvedExporter } from '$lib/types/Export.js';

export interface ResolvedExportArtifact {
    blob: Blob;
    /** Extension override returned by the exporter, otherwise undefined. */
    extension: string | undefined;
}

/**
 * Normalize an {@link ExportResult} into a downloadable `Blob`. Handles the
 * four valid shapes (string / ArrayBuffer / Blob / object form). Object-form
 * `mime` and `extension` override the exporter's defaults for this one
 * download.
 */
export function resolveExportResult(
    result: ExportResult,
    exporter: Pick<ResolvedExporter, 'mime'>
): ResolvedExportArtifact {
    if (result instanceof Blob) {
        return { blob: result, extension: undefined };
    }

    if (typeof result === 'string') {
        return { blob: new Blob([result], { type: exporter.mime }), extension: undefined };
    }

    if (result instanceof ArrayBuffer || ArrayBuffer.isView(result)) {
        return { blob: new Blob([result as BlobPart], { type: exporter.mime }), extension: undefined };
    }

    // Object form: { content, mime?, extension? }
    const mime = result.mime ?? exporter.mime;
    const content = result.content;
    if (content instanceof Blob) {
        // If a mime override is present and differs, rewrap; otherwise pass through.
        if (result.mime && content.type !== result.mime) {
            return { blob: new Blob([content], { type: mime }), extension: result.extension };
        }
        return { blob: content, extension: result.extension };
    }
    const part: BlobPart = typeof content === 'string' ? content : (content as BlobPart);
    return { blob: new Blob([part], { type: mime }), extension: result.extension };
}
