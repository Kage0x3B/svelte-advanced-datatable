import type { DateTime } from 'luxon';
import type { Readable } from 'svelte/store';
import { readable } from 'svelte/store';

// eslint-disable-next-line @typescript-eslint/ban-types
export function hasOwnProperty<X extends {}, Y extends PropertyKey>(obj: X, prop: Y): obj is X & Record<Y, unknown> {
	return Object.hasOwn(obj, prop);
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
