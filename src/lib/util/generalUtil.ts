import type { DateTime } from 'luxon';
import type { Readable } from 'svelte/store';
import { readable } from 'svelte/store';
import type { ApiFunction } from '$lib/types/ApiFunction.js';
import type { PaginatedListRequest } from '$lib/types/PaginatedListRequest.js';
import type { PaginatedListResponse } from '$lib/types/PaginatedListResponse.js';

export const browser = typeof window !== 'undefined';

export function hasOwnProperty<X, Y extends PropertyKey>(obj: X, prop: Y): obj is NonNullable<X> & Record<Y, unknown> {
	// eslint-disable-next-line @typescript-eslint/ban-types
	return typeof obj !== 'undefined' && obj !== null && Object.hasOwn(obj as object, prop);
}

export function isIndexable<X>(obj: X): obj is NonNullable<X> & Record<string, unknown> {
	return typeof obj !== 'undefined' && obj !== null;
}

export function isDateTime(obj: unknown): obj is DateTime {
	return !!(obj && hasOwnProperty(obj, 'isLuxonDateTime') && obj.isLuxonDateTime);
}

export function isStore<T>(store: unknown): store is Readable<T> {
	return !!store && hasOwnProperty(store, 'subscribe');
}

export function wrapPossibleStore<T>(store: T | Readable<T>): Readable<T> {
	return isStore(store) ? store : readable(store);
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function debounce<ArgsType extends unknown[]>(
	func: (...args: ArgsType) => void,
	waitTime: number
): (...args: ArgsType) => void {
	let timer: NodeJS.Timeout;

	return (...args: ArgsType) => {
		clearTimeout(timer);
		timer = setTimeout(() => func(...args), waitTime);
	};
}

export function preventEvent(e: Event): void {
	e.preventDefault();
}

const missingKeyValueMappings = new Set<string>();

/**
 * Map key-value pairs using the passed in map.
 *
 * @param map the mapping from key to value
 * @param key the key to get the value for
 * @param defaultToKey should the key be returned as the value, in case a key to value mapping doesn't exist
 */
export function mapValue<Key extends string, Value extends string>(
	map: Record<Key, Value>,
	key: Key,
	defaultToKey = false
): Value | undefined {
	if (hasOwnProperty(map, key)) {
		return map[key];
	} else {
		if (defaultToKey) {
			return key as unknown as Value;
		} else {
			if (!missingKeyValueMappings.has(key)) {
				const keys = Object.keys(map).slice(0, 5).join(', ');
				const values = Object.values(map).slice(0, 5).join(', ');
				console.warn(`Can't map key ${key} to a value for the mapping ${keys} -> ${values}`);

				missingKeyValueMappings.add(key);
			}

			return undefined;
		}
	}
}

export function wrapFetchToThrow<Data>(
	func: (data: PaginatedListRequest<Data>) => Promise<Response>
): ApiFunction<Data> {
	return async (request) => {
		const res = await func(request);

		let resData: Data | undefined = undefined;

		try {
			resData = await res.json();
			// eslint-disable-next-line no-empty
		} catch (err) {
			console.error(err);
		}

		if (res.ok && typeof resData !== 'undefined') {
			return resData as unknown as PaginatedListResponse<Data>;
		} else {
			const errorMessage = hasOwnProperty(resData, 'message') ? String(resData.message) : 'Unknown network error';
			const error = new Error(errorMessage);

			if (resData) {
				Object.assign(error, resData);
			}

			throw error;
		}
	};
}
