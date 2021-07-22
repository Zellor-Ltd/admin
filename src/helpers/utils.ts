export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

const categoriesArray = [
  {
    key: "Super Category",
    field: "superCategory",
    ep: "ProductSuperCategories",
  },
  { key: "Category", field: "category", ep: "ProductCategories" },
  { key: "Sub Category", field: "subCategory", ep: "ProductSubCategories" },
  {
    key: "Sub Sub Category",
    field: "subSubCategory",
    ep: "ProductSubSubCategories",
  },
];

export const categoriesSettings = {
  categoriesArray,
  categoriesKeys: categoriesArray.map((item) => item.key),
  categoriesFields: categoriesArray.map((item) => item.field),
  categoriesEps: categoriesArray.map((item) => item.ep),
};

export const __prod__ = process.env.REACT_APP_SERVER_ENV === "production";
export const __isDev__ = process.env.REACT_APP_SERVER_ENV === "development";
export const __isDemo__ = process.env.REACT_APP_SERVER_ENV === "demo";
