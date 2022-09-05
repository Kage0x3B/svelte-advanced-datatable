import apiReferenceJson from '../files/api-reference-meta.json';

export const apiReferenceCategories = apiReferenceJson.children.map((c) => c.name);
