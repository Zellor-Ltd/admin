export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

const categoriesArray = [
  {
    key: "Super Category",
    field: "supercategory",
    ep: "ProductSuperCategories",
  },
  { key: "Category", field: "category", ep: "ProductCategories" },
  { key: "Sub Category", field: "subcategory", ep: "ProductSubCategories" },
  {
    key: "Sub Sub Category",
    field: "subsubCategory",
    ep: "ProductSubSubCategories",
  },
];

export const categoriesSettings = {
  categoriesArray,
  categoriesKeys: categoriesArray.map((item) => item.key),
  categoriesFields: categoriesArray.map((item) => item.field),
  categoriesEps: categoriesArray.map((item) => item.ep),
};
