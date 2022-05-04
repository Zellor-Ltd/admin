import {
  Button,
  Col,
  Input,
  PageHeader,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchFanGroups } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import FanGroupDetail from './FanGroupDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const FanGroups: React.FC<RouteComponentProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentFanGroup, setCurrentFanGroup] = useState<FanGroup>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fanGroups, setFanGroups] = useState<FanGroup[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getFanGroups();
  };

  const getFanGroups = async () => {
    const { results } = await doFetch(fetchFanGroups);
    setFanGroups(results);
    setRefreshing(true);
  };

  const fetchData = () => {
    if (!fanGroups.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = fanGroups.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFanGroups(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setFanGroups([]);
      setEof(false);
      fetchData();
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

      if (search(fanGroups).length < 10) setEof(true);
    }
  }, [details, fanGroups]);

  const editFanGroup = (index: number, fanGroup?: FanGroup) => {
    setLastViewedIndex(index);
    setCurrentFanGroup(fanGroup);
    setDetails(true);
  };

  const columns: ColumnsType<FanGroup> = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      width: '20%',
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
      sorter: (a, b): any => {
        if (a.hCreationDate && b.hCreationDate)
          return (
            moment(a.hCreationDate).unix() - moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
      },
    },
  ];

  const search = rows => {
    return rows.filter(row => row.name.toLowerCase().indexOf(filter) > -1);
  };

  const refreshItem = (record: FanGroup) => {
    fanGroups[lastViewedIndex] = record;
    setFanGroups([...fanGroups]);
  };

  const onSaveFanGroup = (record: FanGroup) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelFanGroup = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Fan Groups"
            subTitle="List of Fan Groups"
            extra={[
              <Button key="1" onClick={() => editFanGroup(fanGroups.length)}>
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={8} xs={16}>
              <Typography.Title level={5}>Search by Name</Typography.Title>
              <Input
                className="mb-1"
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={fanGroups.length}
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
            <Table
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={search(fanGroups)}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <FanGroupDetail
          fanGroup={currentFanGroup}
          onSave={onSaveFanGroup}
          onCancel={onCancelFanGroup}
        />
      )}
    </>
  );
};

export default FanGroups;
