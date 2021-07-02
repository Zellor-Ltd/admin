export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });

export const categoriesKeys = [
  "Super Category",
  "Category",
  "Sub Category",
  "Sub Sub Category",
];
