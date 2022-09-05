// @ts-ignore - ignore if the file doesn't exist
import apiReferenceJson from '../../(api-reference)/api-reference/files/api-reference-meta.json';

// @ts-ignore
export const apiReferenceCategories = apiReferenceJson?.children?.map((c) => c.name) ?? [];
