// @ts-ignore - ignore if the file doesn't exist
import apiReferenceJson from '../files/api-reference-meta.json';

// @ts-ignore
export const apiReferenceCategories = apiReferenceJson.children.map((c) => c.name);
