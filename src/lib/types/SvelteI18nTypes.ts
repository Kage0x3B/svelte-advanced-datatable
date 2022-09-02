import type { InterpolationValues } from './MessageFormatter.js';

interface MessageObject {
	id: string;
	locale?: string;
	format?: string;
	default?: string;
	values?: InterpolationValues;
}

export type SvelteI18nMessageFormatter = (id: string | MessageObject, options?: Omit<MessageObject, 'id'>) => string;
