import {
  AllCategories,
  ProductCategory,
  SelectedCategories,
  SelectedProductCategories,
} from "interfaces/Category";
import { useCallback, useEffect, useState } from "react";
import { productCategoriesAPI } from "services/DiscoClubService";
import { categoriesSettings } from "helpers/utils";
import { useRequest } from "./useRequest";

const { categoriesKeys, categoriesFields, categoriesArray } =
  categoriesSettings;

const allCategoriesFactory = (): AllCategories => ({
  "Super Category": [],
  Category: [],
  "Sub Category": [],
  "Sub Sub Category": [],
});

const useAllCategories = ({
  initialValues,
  setLoading,
  allCategories,
}: {
  initialValues?: SelectedCategories;
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>;
  allCategories?: AllCategories;
}): {
  fetchAllCategories: () => Promise<void>;
  allCategories: AllCategories;
  filteredCategories: AllCategories;
  filterCategory: typeof filterCategory;
  loading: boolean;
} => {
  const [_allCategories, _setAllCategories] = useState<AllCategories>(
    allCategoriesFactory()
  );
  const [filteredCategories, setFilteredCategories] = useState<AllCategories>(
    allCategoriesFactory()
  );
  const { doFetch, loading } = useRequest({ setLoading });
  const [selectedCategories, setSelectedCategories] =
    useState<SelectedCategories>(initialValues || {});

  const filterByCheckingTree = (
    selectedValue: string,
    selectedKey: string,
    newFilteredCategories: AllCategories
  ) => {
    const selectedIndex = categoriesKeys.indexOf(selectedKey);
    const selectedField = categoriesFields[selectedIndex];
    const nextKey = categoriesKeys[selectedIndex + 1] as keyof AllCategories;
    if (nextKey) {
      newFilteredCategories[nextKey] = _allCategories[nextKey].filter(
        (category) => {
          const categoryName = category[selectedField as keyof ProductCategory];
          const isPresent = categoryName === selectedValue;
          if (!isPresent) return false;
          for (let i = selectedIndex; i > 0; i--) {
            const fieldToInspect = categoriesFields[
              i - 1
            ] as keyof SelectedCategories;
            const foundInTree =
              selectedCategories[fieldToInspect] === category[fieldToInspect];
            if (!foundInTree) return false;
          }
          return true;
        }
      );
    }
    setSelectedCategories((prev) => {
      prev[selectedField as keyof SelectedCategories] = selectedValue;
      return prev;
    });
  };

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
        filterByCheckingTree(
          selectedValue,
          categoriesKeys[index],
          newFilteredCategories
        );
      } else {
        newFilteredCategories[iteratorKey] = [];
      }
      setFormField(categoriesFields[i]);
    }
    setFilteredCategories(newFilteredCategories);
  };

  useEffect(() => {
    if (allCategories) _setAllCategories(allCategories);
  }, [allCategories]);

  useEffect(() => {
    if (initialValues && _allCategories["Super Category"].length) {
      const newFilteredCategories = allCategoriesFactory();
      categoriesArray.forEach(({ key, field }) => {
        const iteratorField = field as keyof SelectedProductCategories;
        const selectedValue = initialValues[iteratorField];

        if (selectedValue) {
          filterByCheckingTree(selectedValue, key, newFilteredCategories);
        }
      });
      setFilteredCategories({
        ...newFilteredCategories,
        "Super Category": _allCategories["Super Category"],
      });
    } else {
      setFilteredCategories((prev) => {
        return {
          ...prev,
          "Super Category": _allCategories["Super Category"],
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_allCategories, setFilteredCategories]);

  const fetchAllCategories = useCallback(async () => {
    const responses = await Promise.all([
      doFetch(productCategoriesAPI.supercategory.fetch),
      doFetch(productCategoriesAPI.category.fetch),
      doFetch(productCategoriesAPI.subcategory.fetch),
      doFetch(productCategoriesAPI.subsubcategory.fetch),
    ]);

    _setAllCategories({
      "Super Category": responses[0],
      Category: responses[1],
      "Sub Category": responses[2],
      "Sub Sub Category": responses[3],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    fetchAllCategories,
    allCategories: _allCategories,
    filteredCategories,
    filterCategory,
    loading,
  };
};

export default useAllCategories;
