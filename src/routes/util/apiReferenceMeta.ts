// @ts-ignore - ignore when file isn't created by typedoc yet, as typedoc requires no typescript errors
import apiReferenceJson from '../(docs)/(api-reference)/api-reference/api-reference-meta.json';

// @ts-ignore
export const apiReferenceCategories = apiReferenceJson.children.map((c) => c.name);
