import { useRequest, DoRequest, DoFetch } from 'hooks/useRequest';
import { PageInfiniteScrollProvider } from './PageInfiniteScrollContext';
import React, { useEffect, useState } from 'react';

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
  isMobile: boolean;
  isScrollable: boolean;
  setisScrollable: (boolean) => void;
  needsMargin: boolean;
  details: boolean;
  setDetails: (value: boolean) => void;
}

export const AppContext = React.createContext({} as AppContextProps);

export const AppProvider = ({ children }: { children: JSX.Element }) => {
  const [details, setDetails] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [filterValues, setFilterValues] = useState<FilterValue>({});
  const [lastVisitedPage, setLastVisitedPage] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isScrollable, setisScrollable] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);
  const [needsMargin, setNeedsMargin] = useState<boolean>(
    window.innerWidth < 1716 && window.innerWidth > 1376
  );

  const handleResize = () => {
    if (window.innerWidth < 1716 && window.innerWidth > 1376) {
      setNeedsMargin(true);
    } else {
      setNeedsMargin(false);

      if (window.innerWidth < 991) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  const setFilterValue: SetFilterValue = (key, value) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
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
        isMobile,
        needsMargin,
        isScrollable,
        setisScrollable,
        details,
        setDetails,
      }}
    >
      <PageInfiniteScrollProvider>{children}</PageInfiniteScrollProvider>
    </AppContext.Provider>
  );
};
