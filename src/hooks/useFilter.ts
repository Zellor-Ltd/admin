import { useState, useEffect } from 'react';

type FilterFn<T> = (arrayList: T[]) => T[];

interface FilterFnObject<T> {
  [key: string]: FilterFn<T>;
}

const useFilter = <T>(initialArrayListValue: T[]) => {
  const [arrayList, setArrayList] = useState<T[]>(initialArrayListValue);
  const [filteredArrayList, setFilteredArrayList] = useState<T[]>([]);
  const [filterFunctions, setFilterFunctions] = useState<FilterFnObject<T>>({});

  const addFilterFunction = (key: string, fn: FilterFn<T>) => {
    setFilterFunctions(prev => {
      prev[key] = fn;
      return { ...prev };
    });
  };

  const removeFilterFunction = (key: string) => {
    setFilterFunctions(prev => {
      delete prev[key];
      return { ...prev };
    });
  };

  useEffect(() => {
    let _filteredArrayList = [...arrayList];
    for (const key in filterFunctions) {
      if (Object.prototype.hasOwnProperty.call(filterFunctions, key)) {
        const filterFn = filterFunctions[key];
        _filteredArrayList = [...filterFn(_filteredArrayList)];
      }
    }
    setFilteredArrayList(_filteredArrayList);
  }, [filterFunctions, arrayList]);

  return {
    arrayList,
    setArrayList,
    filteredArrayList,
    addFilterFunction,
    removeFilterFunction,
  };
};

export default useFilter;
