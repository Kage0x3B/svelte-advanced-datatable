/**
 * Trigger a Blob download via a temporary anchor click. Cleans up the object
 * URL after the click so we don't leak. SSR-safe — no-ops outside the browser.
 */
export function triggerDownload(blob: Blob, filename: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    // Revoke on the next task to give the browser a tick to start the download.
    setTimeout(() => URL.revokeObjectURL(url), 0);
}
