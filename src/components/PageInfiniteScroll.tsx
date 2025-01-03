import InfiniteScroll from 'react-infinite-scroll-component';

import React, { useContext, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { PageInfiniteScrollContext } from 'contexts/PageInfiniteScrollContext';
import { Spin } from 'antd';

interface PageInfiniteScrollProps {
  refreshCallback: Function;
  fetchTableData: Function;
  dependencies: any[];
}

export const PageInfiniteScroll: React.FC<PageInfiniteScrollProps> = ({
  refreshCallback,
  fetchTableData,
  dependencies,
  children,
}) => {
  const { setRefreshing, refreshing, usePageTable } = useContext(AppContext);
  const { page, eof, refreshContext } = useContext(PageInfiniteScrollContext);
  const [tableData, setTableData] = usePageTable<any>([]);

  useEffect(() => {
    return () => {
      refreshContext();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const getTableData = async () => {
      const { results } = await fetchTableData();
      setTableData(results);
      setRefreshing(false);
    };
    if (refreshing) {
      getTableData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  const updateDisplayedArray = async () => {
    if (!tableData.length) return;
    const { results } = await fetchTableData();
    setTableData(prev => [...prev.concat(results)]);
  };

  useEffect(() => {
    if (tableData.length || eof) {
      refreshCallback();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return (
    <InfiniteScroll
      dataLength={tableData.length}
      next={updateDisplayedArray}
      hasMore={!eof}
      loader={
        page !== 0 && (
          <div className="scroll-message">
            <Spin />
          </div>
        )
      }
      endMessage={
        <div className="scroll-message">
          <b>End of results.</b>
        </div>
      }
    >
      {children}
    </InfiniteScroll>
  );
};
