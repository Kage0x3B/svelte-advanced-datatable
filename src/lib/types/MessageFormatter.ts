export type InterpolationValues = Record<string, string | number | boolean | Date | null | undefined>;

export type MessageFormatter = (
	messageId: string,
	options?: {
		default?: string;
		values?: InterpolationValues;
	}
) => string | undefined;
