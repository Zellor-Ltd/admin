import {AllCategories, SelectedProductCategories} from "../interfaces/Category";
import {FormInstance} from "antd/lib/form";
import {categoriesSettings} from "./utils";

const {categoriesKeys, categoriesFields} = categoriesSettings;

const getCurrentCategories = (form: FormInstance, allCategories: AllCategories) => {
  const currentCategories: SelectedProductCategories = {};

  categoriesFields.forEach((field, index) => {
    form.getFieldValue('categories')?.forEach((productCategory: any) => {
      const category = allCategories[
        categoriesKeys[index] as keyof AllCategories
        ].find((category) => category.id === productCategory[field]?.id);
      currentCategories[field] = category;
    });
  });

  return currentCategories;
}

const getPreviousSearchTags = (productCategoryIndex: number, categoryKey: string, categories: SelectedProductCategories[]): string[] => {
  const categoryIndex = categoriesKeys.indexOf(categoryKey);
  return categoriesFields.slice(categoryIndex)
    .map((field) => categories[productCategoryIndex][field])
    .filter((v) => v && v.searchTags)
    .map((v) => v.searchTags)
    .reduce((prev, curr) => {
      return prev?.concat(curr || []);
    }, []);
}

export const productUtils = {
  getCurrentCategories,
  getPreviousSearchTags,
};