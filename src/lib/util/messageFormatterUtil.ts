import type { Readable } from 'svelte/store';
import { readable } from 'svelte/store';
import type { DataRecord } from '../types/DataRecord.js';
import type { FullDataTableConfig, MessageConfig } from '../types/DataTableConfig.js';
import type { InterpolationValues, MessageFormatter } from '../types/MessageFormatter.js';

export function createMessageFormatter<T extends DataRecord>(
	dataTableConfig: FullDataTableConfig<T>
): Readable<MessageFormatter> {
	if (dataTableConfig.messageFormatterType === 'config') {
		return readable(createConfigMessageFormatter(dataTableConfig, dataTableConfig.messageConfig));
	} else {
		throw new Error('Svelte-i18n message formatter is not implemented yet');
	}
}

function createConfigMessageFormatter<T extends DataRecord>(
	dataTableConfig: FullDataTableConfig<T>,
	messageConfig: MessageConfig<T>
): MessageFormatter {
	const missingMessageIds = new Set<string>();

	return (messageId, options = {}) => {
		const prefix = `dataTable.${dataTableConfig.type}.`;
		if (messageId.startsWith(prefix)) {
			messageId = messageId.substring(prefix.length);
		}

		if (dataTableConfig.additionalMessageFormatter) {
			const additionalFormatterResult = dataTableConfig.additionalMessageFormatter(messageId, options);

			if (additionalFormatterResult) {
				return additionalFormatterResult;
			}
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

function indexObject(object: DataRecord, deepKey: string): string | undefined {
	return deepKey.split('.').reduce(
		// @ts-ignore
		(deepObject, key) => {
			if (
				typeof deepObject === 'undefined' ||
				deepObject === null ||
				typeof deepObject[key] === 'undefined' ||
				deepObject[key] === null
			) {
				return undefined;
			}

			return deepObject[key];
		},
		object
	);
}

function replaceMessageVariables(message: string, values: InterpolationValues): string {
	return message.replace(/{(\w+)}/g, (_, key) => String(values[key]));
}
