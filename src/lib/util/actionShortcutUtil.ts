/**
 * Parse, match, and format keyboard shortcuts for DataTableAction.shortcut.
 *
 * The string syntax is `+`-separated tokens. The last token is the key;
 * everything before it is a modifier. Modifiers (case-insensitive):
 *
 * - `Shift`
 * - `Alt` / `Option`
 * - `Ctrl` / `Control`
 * - `Cmd` / `Meta` / `Super`
 * - `Mod` — auto-resolves to `Cmd` on macOS and `Ctrl` elsewhere
 *
 * Single-letter keys are case-insensitive (`'E'` ≡ `'e'`). Named keys are
 * compared against `KeyboardEvent.key` and accept the standard W3C names
 * (`'Delete'`, `'Enter'`, `'Escape'`, `'Backspace'`, `'Tab'`, `' '` etc.)
 * plus single non-letter characters like `'/'` or `'?'`.
 */

export interface ParsedShortcut {
    /** Letter keys → uppercase ('E'). Named keys → as written ('Delete'). */
    key: string;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}

const parseCache = new Map<string, ParsedShortcut>();

let cachedIsMac: boolean | null = null;
export function isMacPlatform(): boolean {
    if (cachedIsMac !== null) return cachedIsMac;
    if (typeof navigator === 'undefined') return (cachedIsMac = false);
    const platform = (navigator.platform ?? '') + ' ' + (navigator.userAgent ?? '');
    cachedIsMac = /Mac|iPhone|iPod|iPad/i.test(platform);
    return cachedIsMac;
}

export function parseShortcut(shortcut: string): ParsedShortcut {
    const cached = parseCache.get(shortcut);
    if (cached) return cached;

    const tokens = shortcut.split('+').map((t) => t.trim()).filter(Boolean);
    if (tokens.length === 0) {
        throw new Error(`Empty shortcut: ${JSON.stringify(shortcut)}`);
    }
    const keyToken = tokens[tokens.length - 1]!;
    const modifierTokens = tokens.slice(0, -1);

    const parsed: ParsedShortcut = {
        key: normaliseKey(keyToken),
        shift: false,
        ctrl: false,
        alt: false,
        meta: false
    };

    const mac = isMacPlatform();
    for (const token of modifierTokens) {
        const t = token.toLowerCase();
        if (t === 'shift') parsed.shift = true;
        else if (t === 'alt' || t === 'option' || t === 'opt') parsed.alt = true;
        else if (t === 'ctrl' || t === 'control') parsed.ctrl = true;
        else if (t === 'cmd' || t === 'meta' || t === 'super') parsed.meta = true;
        else if (t === 'mod') {
            if (mac) parsed.meta = true;
            else parsed.ctrl = true;
        } else {
            throw new Error(`Unknown shortcut modifier: ${JSON.stringify(token)}`);
        }
    }

    parseCache.set(shortcut, parsed);
    return parsed;
}

function normaliseKey(token: string): string {
    if (token.length === 1) return token.toUpperCase();
    return token;
}

export function matchesShortcut(event: KeyboardEvent, parsed: ParsedShortcut): boolean {
    if (event.shiftKey !== parsed.shift) return false;
    if (event.ctrlKey !== parsed.ctrl) return false;
    if (event.altKey !== parsed.alt) return false;
    if (event.metaKey !== parsed.meta) return false;

    const eventKey = event.key;
    if (eventKey.length === 1) {
        return eventKey.toUpperCase() === parsed.key;
    }
    return eventKey === parsed.key;
}

const NAMED_KEY_GLYPHS_MAC: Record<string, string> = {
    Enter: '⏎',
    Backspace: '⌫',
    Delete: '⌦',
    Escape: '⎋',
    Tab: '⇥',
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    ' ': 'Space'
};

export function formatShortcut(shortcut: string): string {
    const parsed = parseShortcut(shortcut);
    const mac = isMacPlatform();
    if (mac) {
        const parts: string[] = [];
        if (parsed.ctrl) parts.push('⌃');
        if (parsed.alt) parts.push('⌥');
        if (parsed.shift) parts.push('⇧');
        if (parsed.meta) parts.push('⌘');
        parts.push(NAMED_KEY_GLYPHS_MAC[parsed.key] ?? parsed.key);
        return parts.join('');
    }
    const parts: string[] = [];
    if (parsed.ctrl) parts.push('Ctrl');
    if (parsed.alt) parts.push('Alt');
    if (parsed.shift) parts.push('Shift');
    if (parsed.meta) parts.push('Meta');
    parts.push(parsed.key === ' ' ? 'Space' : parsed.key);
    return parts.join('+');
}
