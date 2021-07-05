import {
  AllCategories,
  ProductCategory,
  SelectedCategories,
  SelectedProductCategories,
} from "interfaces/Category";
import { useCallback, useEffect, useState } from "react";
import { productCategoriesAPI } from "services/DiscoClubService";
import { categoriesSettings } from "helpers/utils";

const { categoriesKeys, categoriesFields, categoriesArray } =
  categoriesSettings;

const allCategoriesFactory = (): AllCategories => ({
  "Super Category": [],
  Category: [],
  "Sub Category": [],
  "Sub Sub Category": [],
});

const useAllCategories = (
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  selectedCategories?: SelectedCategories,
  selectedProductCategories?: SelectedProductCategories
): {
  fetchAllCategories: () => Promise<void>;
  allCategories: AllCategories;
  filteredCategories: AllCategories;
  filterCategory: typeof filterCategory;
  _loading: boolean;
} => {
  const [allCategories, setAllCategories] = useState<AllCategories>(
    allCategoriesFactory()
  );
  const [filteredCategories, setFilteredCategories] = useState<AllCategories>(
    allCategoriesFactory()
  );
  const [_loading, _setLoading] = useState<boolean>(false);

  const filterCategory = (
    selectedValue: string,
    key: string,
    setFormField: (field: string) => void
  ) => {
    const newFilteredCategories = { ...filteredCategories };

    const index = categoriesKeys.indexOf(key);

    for (let i = index + 1; i < categoriesKeys.length; i++) {
      const iteratorKey = categoriesKeys[i] as keyof AllCategories;
      if (i === index + 1) {
        newFilteredCategories[iteratorKey] = allCategories[iteratorKey].filter(
          (category) => {
            return (
              category[categoriesFields[i - 1] as keyof ProductCategory] ===
              selectedValue
            );
          }
        );
      } else {
        newFilteredCategories[iteratorKey] = [];
      }
      setFormField(categoriesFields[i]);
    }
    setFilteredCategories(newFilteredCategories);
  };

  useEffect(() => {
    if (
      (selectedCategories || selectedProductCategories) &&
      allCategories["Super Category"].length
    ) {
      const newFilteredCategories = allCategoriesFactory();
      categoriesArray.forEach(({ key: currKey, field: currField }, index) => {
        if (index === 0) return;
        const prevField = categoriesFields[index - 1];

        let selectedValue: string | undefined;
        if (selectedProductCategories) {
          selectedValue =
            selectedProductCategories?.[
              prevField as keyof SelectedProductCategories
            ]?.[prevField as keyof SelectedProductCategories];
        } else if (selectedCategories) {
          selectedValue =
            selectedCategories[prevField as keyof SelectedCategories];
        }

        if (selectedValue) {
          newFilteredCategories[currKey as keyof AllCategories] = allCategories[
            currKey as keyof AllCategories
          ].filter((category) => {
            return (
              category[prevField as keyof ProductCategory] === selectedValue
            );
          });
        }
      });
      setFilteredCategories({
        ...newFilteredCategories,
        "Super Category": allCategories["Super Category"],
      });
    } else {
      setFilteredCategories((prev) => {
        return {
          ...prev,
          "Super Category": allCategories["Super Category"],
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCategories, setFilteredCategories]);

  const fetchAllCategories = useCallback(async () => {
    try {
      _setLoading(true);
      if (setLoading) {
        setLoading(true);
      }
      const responses: any[] = await Promise.all([
        productCategoriesAPI.supercategory.fetch(),
        productCategoriesAPI.category.fetch(),
        productCategoriesAPI.subcategory.fetch(),
        productCategoriesAPI.subsubcategory.fetch(),
      ]);
      _setLoading(false);
      if (setLoading) {
        setLoading(false);
      }
      setAllCategories({
        "Super Category": responses[0].results,
        Category: responses[1].results,
        "Sub Category": responses[2].results,
        "Sub Sub Category": responses[3].results,
      });
    } catch (err) {
      _setLoading(false);
      if (setLoading) {
        setLoading(false);
      }
    }
  }, [setLoading]);

  return {
    fetchAllCategories,
    allCategories,
    filteredCategories,
    filterCategory,
    _loading,
  };
};

export default useAllCategories;
