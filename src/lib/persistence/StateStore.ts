/**
 * Codec for serializing a typed value to/from a string. Used by URL and
 * Web Storage backends; ignored by the in-memory snapshot backend.
 */
export interface Codec<T> {
    encode(value: T): string;
    decode(raw: string): T;
}

/**
 * Backend-agnostic storage interface used by the persistence layer.
 *
 * `get` returns `fallback` when the key is unset. `set` with a value equal to
 * `fallback` deletes the key (default-elision keeps URLs and storage clean).
 *
 * Implementations may opt into change notifications via `subscribe` (URL
 * back/forward, cross-tab `storage` events). Stores without external mutation
 * sources omit it.
 */
export interface StateStore {
    get<T>(key: string, fallback: T, codec: Codec<T>): T;
    set<T>(key: string, value: T, fallback: T, codec: Codec<T>): void;
    subscribe?(callback: () => void): () => void;
}
