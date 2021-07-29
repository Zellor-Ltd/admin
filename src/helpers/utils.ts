import { categoriesArray } from "./constants";
export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

export const categoriesSettings = {
  categoriesArray,
  categoriesKeys: categoriesArray.map((item) => item.key),
  categoriesFields: categoriesArray.map((item) => item.field),
  categoriesEps: categoriesArray.map((item) => item.ep),
};
