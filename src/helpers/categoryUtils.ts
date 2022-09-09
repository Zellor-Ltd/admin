import {
  AllCategories,
  SelectedProductCategories,
} from '../interfaces/Category';
import { FormInstance } from 'antd/lib/form';
import { categoryMapper } from './categoryMapper';
import update from 'immutability-helper';
import { Product } from '../interfaces/Product';
import { ProductBrand } from 'interfaces/ProductBrand';

const { categoriesKeys, categoriesFields } = categoryMapper;

const getCategories = (form: FormInstance, allCategories: AllCategories) => {
  const currentCategories: SelectedProductCategories = {};

  categoriesFields.forEach((field, index) => {
    form.getFieldValue('categories')?.forEach((item: any) => {
      const category = allCategories[
        categoriesKeys[index] as keyof AllCategories
      ].find(category => category.id === item[field]?.id);
      currentCategories[field] = category;
    });
  });

  return currentCategories;
};

const getSearchTags = (
  category: SelectedProductCategories,
  categoryKey?: any,
  filterFn?: any
) => {
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
  itemIndex: number,
  entity: Product | ProductBrand | undefined,
  form: FormInstance
) => {
  if (entity && entity?.categories) {
    const updatedCategories: any[] = update(entity.categories as any, {
      $splice: [[itemIndex, 1]],
    });
    const remainingTags = updatedCategories
      .map(category => getSearchTags(category))
      .reduce((prev, curr) => {
        return prev?.concat(curr || []);
      }, []);

    form.setFieldsValue({
      searchTags: Array.from(new Set([...remainingTags])),
    });

    entity.categories = updatedCategories;
    entity.searchTags = remainingTags;
  }
};

export const categoryUtils = {
  getCategories,
  getSearchTags,
  removeSearchTagsByCategory,
};
