import { fromStore } from 'svelte/store';
import type { format as svelteI18nFormat } from 'svelte-i18n';
import type { FullDataTableConfig, MessageConfig } from '$lib/types/DataTableConfig.js';
import type { InterpolationValues, MessageFormatter } from '$lib/types/MessageFormatter.js';

export function createMessageFormatter<Data>(dataTableConfig: FullDataTableConfig<Data>): MessageFormatter {
    if (dataTableConfig.messageFormatter === 'config') {
        return createConfigMessageFormatter(dataTableConfig, dataTableConfig.messageConfig);
    } else if (typeof dataTableConfig.messageFormatter === 'object') {
        return createSvelteI18nMessageFormatter(dataTableConfig, dataTableConfig.messageFormatter);
    } else {
        throw new Error(
            `Invalid message formatter ${dataTableConfig.messageFormatter} in dataTable ${dataTableConfig.type}`
        );
    }
}

function createConfigMessageFormatter<Data>(
    dataTableConfig: FullDataTableConfig<Data>,
    messageConfig: MessageConfig<Data>
): MessageFormatter {
    const missingMessageIds = new Set<string>();

    return (messageId, options = {}) => {
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
    dataTableConfig: FullDataTableConfig<Data>,
    format: typeof svelteI18nFormat
): MessageFormatter {
    const svelteI18nFormat = fromStore(format);

    return (messageId, options) => {
        return svelteI18nFormat.current({
            id: `${dataTableConfig.messageFormatterPrefix ?? ''}${messageId}`,
            values: options?.values,
            default: options?.default
        });
    };
}
