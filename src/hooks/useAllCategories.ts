import { AllCategories } from "interfaces/Category";
import { useCallback, useEffect, useState } from "react";
import {
  fetchProductSuperCategories,
  fetchProductCategories,
  fetchProductSubCategories,
  fetchProductSubSubCategories,
} from "services/DiscoClubService";
import { categoriesSettings } from "helpers/utils";
import { FormInstance } from "antd";

const { categoriesKeys, categoriesFields } = categoriesSettings;

const useAllCategories = (
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
): {
  fetchAllCategories: () => Promise<void>;
  allCategories: AllCategories;
  filteredCategories: AllCategories;
  filterCategory: Function;
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
    setFilteredCategories((prev) => ({
      ...prev,
      "Super Category": allCategories["Super Category"],
    }));
  }, [allCategories, setFilteredCategories]);

  const [_loading, _setLoading] = useState<boolean>(false);

  const filterCategory = (
    key: string,
    value: string,
    form: FormInstance<any>
  ) => {
    const newFilteredCategories = { ...filteredCategories };

    const index = categoriesKeys.indexOf(key);

    for (let i = index + 1; i < categoriesKeys.length; i++) {
      const iteratorKey = categoriesKeys[i] as keyof AllCategories;
      if (i === index + 1) {
        newFilteredCategories[iteratorKey] = allCategories[iteratorKey].filter(
          () => true
        );
      } else {
        newFilteredCategories[iteratorKey] = [];
      }
      form.setFieldsValue({ [categoriesFields[i]]: "" });
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
        fetchProductSuperCategories(),
        fetchProductCategories(),
        fetchProductSubCategories(),
        fetchProductSubSubCategories(),
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
