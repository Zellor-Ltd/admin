import {
  AllCategories,
  ProductCategory,
  SelectedProductCategories,
} from "interfaces/Category";
import { useCallback, useEffect, useState } from "react";
import { productCategoriesAPI } from "services/DiscoClubService";
import { categoriesSettings } from "helpers/utils";

const { categoriesKeys, categoriesFields } = categoriesSettings;

const useAllCategories = (
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  selectedCategories?: SelectedProductCategories
): {
  fetchAllCategories: () => Promise<void>;
  allCategories: AllCategories;
  filteredCategories: AllCategories;
  filterCategory: typeof filterCategory;
  _loading: boolean;
} => {
  const [allCategories, setAllCategories] = useState<AllCategories>({
    "Super Category": [],
    Category: [],
    "Sub Category": [],
    "Sub Sub Category": [],
  });
  const [filteredCategories, setFilteredCategories] = useState<AllCategories>({
    "Super Category": [],
    Category: [],
    "Sub Category": [],
    "Sub Sub Category": [],
  });

  useEffect(() => {
    setFilteredCategories((prev) => {
      return {
        "Super Category": allCategories["Super Category"],
        Category: selectedCategories?.category
          ? [selectedCategories?.category]
          : [],
        "Sub Category": selectedCategories?.subcategory
          ? [selectedCategories?.subcategory]
          : [],
        "Sub Sub Category": selectedCategories?.subsubcategory
          ? [selectedCategories?.subsubcategory]
          : [],
      };
    });
  }, [allCategories, selectedCategories, setFilteredCategories]);

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
