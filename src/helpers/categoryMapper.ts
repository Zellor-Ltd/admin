import { categoriesArray } from './constants';

export const categoryMapper = {
  categoriesArray,
  categoriesKeys: categoriesArray.map(item => item.key),
  categoriesFields: categoriesArray.map(item => item.field),
  categoriesEps: categoriesArray.map(item => item.ep),
};
