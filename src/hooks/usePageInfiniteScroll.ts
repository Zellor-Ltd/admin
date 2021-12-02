import { useContext } from 'react';
import { AppContext } from 'contexts/AppContext';
import { PageInfiniteScrollContext } from 'contexts/PageInfiniteScrollContext';

export const usePageInfiniteScroll = (fetchFn: Function, filters: {}) => {
  const { refreshing, setRefreshing, doFetch, refreshContext } =
    useContext(AppContext);
  const { page, setPage, setEof } = useContext(PageInfiniteScrollContext);

  const fetchTableData = async () => {
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchFn({
        limit: 30,
        page: pageToUse,
        ...filters,
      })
    );
    setPage(pageToUse + 1);
    if (response.results.length < 30) setEof(true);
    return response;
  };

  const refreshTable = () => {
    refreshContext();
    setRefreshing(true);
  };

  return { fetchTableData, refreshTable };
};
