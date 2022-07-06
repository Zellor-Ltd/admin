import {
  Button,
  Col,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchTrends, saveTrend } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';

const Trends: React.FC<RouteComponentProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTrend, setCurrentTrend] = useState<any>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [updatingTrendIndex, setUpdatingTrendIndex] = useState<
    Record<string, boolean>
  >({});
  const shouldUpdateTrendIndex = useRef(false);
  const originalTrendsIndex = useRef<Record<string, number | undefined>>({});
  const [content, setContent] = useState<any[]>([]);

  const getResources = async () => {
    await getTrends();
  };

  const getTrends = async () => {
    const { results } = await doFetch(fetchTrends);
    setContent(results);
    setRefreshing(true);
  };

  const updateDisplayedArray = () => {
    if (!content.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = content.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setTrends(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setTrends([]);
      setEof(false);
      updateDisplayedArray();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );

      if (search(trends).length < 10) setEof(true);
    }
  }, [details, trends]);

  const onColumnChange = (trendIndex: number, trend: any) => {
    for (let i = 0; i < trends.length; i++) {
      if (trends[i].id === trend.id) {
        if (originalTrendsIndex.current[trend.id] === undefined) {
          originalTrendsIndex.current[trend.id] = trend.index;
        }

        shouldUpdateTrendIndex.current =
          originalTrendsIndex.current[trend.id] !== trendIndex;

        trends[i].index = trendIndex;
        setTrends([...trends]);
        break;
      }
    }
  };

  const onColumnBlur = async (trend: any) => {
    if (!shouldUpdateTrendIndex.current) {
      return;
    }
    setUpdatingTrendIndex(prev => {
      const newValue = {
        ...prev,
      };
      newValue[trend.id] = true;

      return newValue;
    });
    try {
      await saveTrend(trend);
      message.success('Register updated with success.');
    } catch (err) {
      console.error(
        `Error while trying to update Trend[${trend.id}] index.`,
        err
      );
      message.success('Error while trying to update Trend index.');
    }
    setUpdatingTrendIndex(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[trend.id];
      return newValue;
    });
    delete originalTrendsIndex.current[trend.id];
    shouldUpdateTrendIndex.current = false;
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Index',
      dataIndex: 'index',
      width: '5%',
      render: (_, trend) => {
        if (updatingTrendIndex[trend.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              type="number"
              value={trend.index}
              onChange={trendIndex => onColumnChange(trendIndex, trend as any)}
              onBlur={() => onColumnBlur(trend as any)}
            />
          );
        }
      },
      align: 'center',
      sorter: (a, b): any => {
        if (a.index && b.index) return a.index - b.index;
        else if (a.index) return -1;
        else if (b.index) return 1;
        else return 0;
      },
    },
    {
      title: 'Description',
      dataIndex: 'tag',
      width: '95%',
      sorter: (a, b): any => {
        if (a.tag && b.tag) return a.tag.localeCompare(b.tag);
        else if (a.tag) return -1;
        else if (b.tag) return 1;
        else return 0;
      },
    },
  ];

  const search = rows => {
    return rows.filter(
      row => row.tag?.toUpperCase().indexOf(filter.toUpperCase()) > -1
    );
  };

  const refreshItem = (record: any) => {
    trends[lastViewedIndex] = record;
    setTrends([...trends]);
  };

  const onSaveTrend = (record: any) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelTrend = () => {
    setDetails(false);
  };

  return (
    <>
      <div>
        <PageHeader title="Trends" subTitle="List of Trends" />
        <Row
          gutter={8}
          align="bottom"
          justify="space-between"
          className="mb-1 sticky-filter-box"
        >
          <Col lg={8} xs={16}>
            <Typography.Title level={5}>Search by Description</Typography.Title>
            <Input
              className="mb-1"
              value={filter}
              onChange={event => {
                setFilter(event.target.value);
              }}
            />
          </Col>
          <Col>
            <Row justify="end">
              <Button
                type="primary"
                onClick={getResources}
                className="mb-1"
                loading={loading}
              >
                Search
                <SearchOutlined style={{ color: 'white' }} />
              </Button>
            </Row>
          </Col>
        </Row>
        <InfiniteScroll
          dataLength={trends.length}
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
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={search(trends)}
            loading={loading || refreshing}
            pagination={false}
          />
        </InfiniteScroll>
      </div>
    </>
  );
};

export default Trends;
