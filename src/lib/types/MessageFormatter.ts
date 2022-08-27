type InterpolationValues = Record<string, string | number | boolean | Date | null | undefined>;

export type MessageFormatter = (id: string, values?: InterpolationValues) => string;
