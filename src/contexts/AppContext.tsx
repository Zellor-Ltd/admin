import { useRequest, DoRequest, DoFetch } from "hooks/useRequest";
import { PageInfiniteScrollProvider } from "./PageInfiniteScrollContext";
import React, { useState } from "react";

type FilterValue = {
  [key: string]: any;
};

type SetFilterValue = (key: string, value: any) => void;

type UsePageFilter = <T>(key: string) => [T, (value: T) => void];

type UsePageTable = <T>(
  initialValue: T[]
) => [T[], React.Dispatch<React.SetStateAction<T[]>>];

interface AppContextProps {
  filterValues: FilterValue;
  setFilterValues: React.Dispatch<React.SetStateAction<FilterValue>>;
  lastVisitedPage: string;
  setLastVisitedPage: React.Dispatch<React.SetStateAction<string>>;
  setFilterValue: SetFilterValue;
  usePageFilter: UsePageFilter;
  usePageTable: UsePageTable;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshing: boolean;
  setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
  doFetch: DoFetch;
  doRequest: DoRequest;
  refreshContext: Function;
}

export const AppContext = React.createContext({} as AppContextProps);

export const AppProvider = ({ children }: { children: JSX.Element }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [filterValues, setFilterValues] = useState<FilterValue>({});
  const [lastVisitedPage, setLastVisitedPage] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);

  const setFilterValue: SetFilterValue = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const usePageFilter: UsePageFilter = <T,>(key: string) => {
    return [filterValues[key], (value: T) => setFilterValue(key, value)];
  };

  const usePageTable: UsePageTable = () => [tableData, setTableData];

  const refreshContext = () => {
    setFilterValues({});
    setTableData([]);
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
        usePageTable,
        loading,
        setLoading,
        refreshing,
        setRefreshing,
        doFetch,
        doRequest,
        refreshContext,
      }}
    >
      <PageInfiniteScrollProvider>{children}</PageInfiniteScrollProvider>
    </AppContext.Provider>
  );
};
