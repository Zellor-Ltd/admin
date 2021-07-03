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

const useFetchAllCategories = (
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
): [() => Promise<void>, AllCategories, AllCategories, Function, boolean] => {
  const [allCategories, setAllCategories] = useState<AllCategories>({
    "Super Category": [],
    Category: [],
    "Sub Category": [],
    "Sub Sub Category": [],
  });
  const [filteredAllCategories, setFilteredAllCategories] =
    useState<AllCategories>({
      "Super Category": [],
      Category: [],
      "Sub Category": [],
      "Sub Sub Category": [],
    });

  useEffect(() => {
    setFilteredAllCategories((prev) => ({
      ...prev,
      "Super Category": allCategories["Super Category"],
    }));
  }, [allCategories, setFilteredAllCategories]);

  const [_loading, _setLoading] = useState<boolean>(false);

  const filterCategory = (
    key: string,
    value: string,
    form: FormInstance<any>
  ) => {
    const newFilteredCategories = { ...filteredAllCategories };

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
    setFilteredAllCategories(newFilteredCategories);
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

  return [
    fetchAllCategories,
    allCategories,
    filteredAllCategories,
    filterCategory,
    _loading,
  ];
};

export default useFetchAllCategories;
