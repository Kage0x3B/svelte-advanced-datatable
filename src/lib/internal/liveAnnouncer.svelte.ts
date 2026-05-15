import { tick } from 'svelte';

/**
 * Backing state for the table's polite ARIA live region. Producers (sort
 * toggles, search settles, …) call `announce()` and the live-region
 * component renders the message. The brief reset to `''` between
 * announcements ensures identical consecutive messages are still spoken
 * — screen readers ignore a live-region update when the text content
 * hasn't changed.
 */
export class LiveAnnouncer {
    message = $state('');

    announce(text: string): void {
        if (!text) return;
        this.message = '';
        void tick().then(() => {
            this.message = text;
        });
    }
}
