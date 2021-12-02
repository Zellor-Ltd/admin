import {
  AllCategories,
  SelectedProductCategories,
} from '../interfaces/Category';
import { FormInstance } from 'antd/lib/form';
import { categoriesSettings } from './utils';
import update from 'immutability-helper';
import { Product } from '../interfaces/Product';

const { categoriesKeys, categoriesFields } = categoriesSettings;

const getCategories = (form: FormInstance, allCategories: AllCategories) => {
  const currentCategories: SelectedProductCategories = {};

  categoriesFields.forEach((field, index) => {
    form.getFieldValue('categories')?.forEach((productCategory: any) => {
      const category = allCategories[
        categoriesKeys[index] as keyof AllCategories
      ].find(category => category.id === productCategory[field]?.id);
      currentCategories[field] = category;
    });
  });

  return currentCategories;
};

const getSearchTags = (
  category: SelectedProductCategories,
  categoryKey?: string,
  filterFn?: any
): string[] => {
  if (!category) {
    return [];
  }

  let categoryIndex = 0;

  if (categoryKey) {
    categoryIndex = categoriesKeys.indexOf(categoryKey);
  }

  const searchTags: string[] = categoriesFields
    .slice(categoryIndex)
    .map(field => category[field])
    .filter(v => v && v.searchTags)
    .map(v => v.searchTags)
    .reduce((prev, curr) => {
      return prev?.concat(curr || []);
    }, []);

  if (filterFn) {
    return searchTags.filter(filterFn);
  }

  return searchTags;
};

const removeSearchTagsByCategory = (
  productCategoryIndex: number,
  product: Product | undefined,
  form: FormInstance
) => {
  if (product && product?.categories) {
    const updatedCategories: any[] = update(product.categories as any, {
      $splice: [[productCategoryIndex, 1]],
    });
    const remainingTags = updatedCategories
      .map(category => getSearchTags(category))
      .reduce((prev, curr) => {
        return prev?.concat(curr || []);
      }, []);

    form.setFieldsValue({
      searchTags: Array.from(new Set([...remainingTags])),
    });

    product.categories = updatedCategories;
    product.searchTags = remainingTags;
  }
};

export const productUtils = {
  getCategories,
  getSearchTags,
  removeSearchTagsByCategory,
};
