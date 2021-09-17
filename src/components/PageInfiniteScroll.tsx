import InfiniteScroll from "react-infinite-scroll-component";

import React, { useRef, useContext, useEffect } from "react";
import { AppContext } from "contexts/AppContext";
import { PageInfiniteScrollContext } from "contexts/PageInfiniteScrollContext";
import { Spin } from "antd";
import { useIsMounted } from "hooks/useIsMounted";

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
  const { page, setPage, eof, setEof } = useContext(PageInfiniteScrollContext);
  const [tableData, setTableData] = usePageTable<any>([]);

  console.log("infinite render");

  const refreshTable = async () => {
    refreshCallback();
    setPage(0);
    setEof(false);
    setRefreshing(true);
  };

  useEffect(() => {
    return () => {
      setPage(0);
      setEof(false);
      setTableData([]);
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
      setEof(false);
      getTableData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  const fetchData = async () => {
    if (!tableData.length) return;
    const { results } = await fetchTableData();
    setTableData((prev) => [...prev.concat(results)]);
  };

  useEffect(() => {
    if (tableData.length || eof) {
      refreshTable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return (
    <InfiniteScroll
      dataLength={tableData.length}
      next={fetchData}
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
