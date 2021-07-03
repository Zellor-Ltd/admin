import { AllCategories } from "interfaces/Category";
import { useCallback, useState } from "react";
import {
  fetchProductSuperCategories,
  fetchProductCategories,
  fetchProductSubCategories,
  fetchProductSubSubCategories,
} from "services/DiscoClubService";

const useFetchAllCategories = (
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>
): [() => Promise<void>, AllCategories, boolean] => {
  const [allCategories, setAllCategories] = useState<AllCategories>({
    "Super Category": [],
    Category: [],
    "Sub Category": [],
    "Sub Sub Category": [],
  });
  const [_loading, _setLoading] = useState<boolean>(false);

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

  return [fetchAllCategories, allCategories, _loading];
};

export default useFetchAllCategories;
