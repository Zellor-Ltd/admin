import { Button, Col, PageHeader, Row, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
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
  const [filteredFanGroups, setFilteredFanGroups] = useState<FanGroup[]>([]);

  const {
    setArrayList: setFanGroups,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<FanGroup>([]);

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
    if (!filteredContent.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredFanGroups(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredFanGroups([]);
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
    }
  }, [details]);

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
    },
  ];

  const searchFilterFunction = (filterText: string) => {
    if (!filterText) {
      removeFilterFunction('fanGroupName');
      setRefreshing(true);
      return;
    }
    addFilterFunction('fanGroupName', fanGroups =>
      fanGroups.filter(fanGroup =>
        fanGroup.name.toUpperCase().includes(filterText.toUpperCase())
      )
    );
    setRefreshing(true);
  };

  const refreshItem = (record: FanGroup) => {
    filteredFanGroups[lastViewedIndex] = record;
    setFanGroups([...filteredFanGroups]);
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
              <Button
                key="1"
                onClick={() => editFanGroup(filteredFanGroups.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by Name"
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={filteredFanGroups.length}
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
              dataSource={filteredFanGroups}
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
