/**
 * The value used to identify a row in selection state. Read from the row using
 * {@link DataTableConfig.dataUniquePropertyKey}, so the runtime type matches
 * whatever that property holds (most commonly a numeric or string id).
 */
export type SelectionId = string | number;
