export const __prod__ = process.env.REACT_APP_SERVER_ENV === 'production';
export const __isDev__ = process.env.REACT_APP_SERVER_ENV === 'development';
export const __isDemo__ = process.env.REACT_APP_SERVER_ENV === 'demo';

export const discoBrandId = '57111747-53ad-4449-a624-87f1c1545262_STR';

export const categoriesArray = [
  {
    key: 'Super Category',
    field: 'superCategory',
    ep: 'ProductSuperCategories',
  },
  { key: 'Category', field: 'category', ep: 'ProductCategories' },
  { key: 'Sub Category', field: 'subCategory', ep: 'ProductSubCategories' },
  {
    key: 'Sub Sub Category',
    field: 'subSubCategory',
    ep: 'ProductSubSubCategories',
  },
];
