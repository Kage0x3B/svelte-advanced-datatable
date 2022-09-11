import type { Readable, Unsubscriber } from 'svelte/store';
import { readable } from 'svelte/store';
import type { FullDataTableConfig, MessageConfig } from '../types/DataTableConfig.js';
import type { InterpolationValues, MessageFormatter } from '../types/MessageFormatter.js';
import type { SvelteI18nMessageFormatter } from '../types/SvelteI18nTypes.js';

export function createMessageFormatter<Data>(dataTableConfig: FullDataTableConfig<Data>): Readable<MessageFormatter> {
	if (dataTableConfig.messageFormatterType === 'config') {
		return readable(createConfigMessageFormatter(dataTableConfig, dataTableConfig.messageConfig));
	} else if (dataTableConfig.messageFormatterType === 'svelte-i18n') {
		return createSvelteI18nMessageFormatter(dataTableConfig);
	} else {
		throw new Error(
			`Invalid message formatter type ${dataTableConfig.messageFormatterType} in datatable ${dataTableConfig.type}`
		);
	}
}

function createConfigMessageFormatter<Data>(
	dataTableConfig: FullDataTableConfig<Data>,
	messageConfig: MessageConfig<Data>
): MessageFormatter {
	const missingMessageIds = new Set<string>();

	return (messageId, options = {}) => {
		if (dataTableConfig.additionalMessageFormatter) {
			const additionalFormatterResult = dataTableConfig.additionalMessageFormatter(messageId, options);

			if (additionalFormatterResult) {
				return additionalFormatterResult;
			}
		}

		const prefix = `dataTable.${dataTableConfig.type}.`;
		if (messageId.startsWith(prefix)) {
			messageId = messageId.substring(prefix.length);
		}

		const rawMessage = indexObject(messageConfig, messageId);

		if (!rawMessage) {
			if (options.default) {
				return options.default;
			}

			if (!missingMessageIds.has(messageId)) {
				console.warn(`DataTable ${dataTableConfig.type} is missing message ${messageId}`);

				missingMessageIds.add(messageId);
			}

			return messageId;
		}

		return replaceMessageVariables(rawMessage, options.values ?? {});
	};
}

function indexObject<Data>(object: Data, deepKey: string): string | undefined {
	return deepKey.split('.').reduce(
		// @ts-ignore
		(deepObject, key) => {
			if (
				typeof deepObject === 'undefined' ||
				deepObject === null ||
				typeof deepObject![key as keyof typeof deepObject] === 'undefined' ||
				deepObject![key as keyof typeof deepObject] === null
			) {
				return undefined;
			}

			return deepObject![key as keyof typeof deepObject];
		},
		object
	) as string;
}

function replaceMessageVariables(message: string, values: InterpolationValues): string {
	return message.replace(/{(\w+)}/g, (_, key) => String(values[key]));
}

function createSvelteI18nMessageFormatter<Data>(
	dataTableConfig: FullDataTableConfig<Data>
): Readable<MessageFormatter> {
	return readable<MessageFormatter>(
		() => '',
		(set) => {
			let svelteI18nUnsubscriber: Unsubscriber | undefined;

			(async () => {
				const { format } = await import('svelte-i18n');

				svelteI18nUnsubscriber = format.subscribe(
					(value) => {
						set(buildInternalSvelteI18nFormatter(dataTableConfig, value));
					},
					() => {
						set(() => '');
					}
				);
			})();

			return () => {
				svelteI18nUnsubscriber && svelteI18nUnsubscriber();
			};
		}
	);
}

function buildInternalSvelteI18nFormatter<Data>(
	dataTableConfig: FullDataTableConfig<Data>,
	format: SvelteI18nMessageFormatter
): MessageFormatter {
	return (messageId, options) => {
		return format({
			id: `${dataTableConfig.messageFormatterPrefix ?? ''}${messageId}`,
			values: options?.values,
			default: options?.default
		});
	};
}
