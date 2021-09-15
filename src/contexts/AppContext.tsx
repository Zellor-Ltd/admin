import React, { useState } from "react";

type FilterValue = {
  [key: string]: any;
};

type SetFilterValue = (key: string, value: any) => void;

type UsePageFilter = <T>(key: string) => [T, (value: T) => void];

interface AppContextProps {
  filterValues: FilterValue;
  setFilterValues: React.Dispatch<React.SetStateAction<FilterValue>>;
  lastVisitedPage: string;
  setLastVisitedPage: React.Dispatch<React.SetStateAction<string>>;
  setFilterValue: SetFilterValue;
  usePageFilter: UsePageFilter;
}

export const AppContext = React.createContext({} as AppContextProps);

export const AppProvider = ({ children }: { children: JSX.Element }) => {
  const [filterValues, setFilterValues] = useState<FilterValue>({});
  const [lastVisitedPage, setLastVisitedPage] = useState<string>("");

  const setFilterValue: SetFilterValue = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const usePageFilter: UsePageFilter = <T,>(key: string) => {
    return [filterValues[key], (value: T) => setFilterValue(key, value)];
  };

  return (
    <AppContext.Provider
      value={{
        filterValues,
        setFilterValues,
        lastVisitedPage,
        setLastVisitedPage,
        setFilterValue,
        usePageFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
