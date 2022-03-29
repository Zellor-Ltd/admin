import { Button, Col, PageHeader, Row, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchVideoTypes } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import VideoTypeDetail from './VideoTypeDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import { VideoType } from 'interfaces/VideoType';

const VideoTypes: React.FC<RouteComponentProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentVideoType, setCurrentVideoType] = useState<FanGroup>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filteredVideoTypes, setFilteredVideoTypes] = useState<VideoType[]>([]);

  const {
    setArrayList: setVideoTypes,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<FanGroup>([]);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getVideoTypes();
  };

  const getVideoTypes = async () => {
    const { results } = await doFetch(fetchVideoTypes);
    setVideoTypes(results);
    setRefreshing(true);
  };

  const fetchData = () => {
    if (!filteredContent.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredVideoTypes(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredVideoTypes([]);
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

  const editFanGroup = (index: number, videoType?: FanGroup) => {
    setLastViewedIndex(index);
    setCurrentVideoType(videoType);
    setDetails(true);
  };

  const columns: ColumnsType<FanGroup> = [
    {
      title: 'Name',
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
      removeFilterFunction('name');
      setRefreshing(true);
      return;
    }
    addFilterFunction('name', videoTypes =>
      videoTypes.filter(videoType =>
        videoType.name.toUpperCase().includes(filterText.toUpperCase())
      )
    );
    setRefreshing(true);
  };

  const refreshItem = (record: FanGroup) => {
    filteredVideoTypes[lastViewedIndex] = record;
    setVideoTypes([...filteredVideoTypes]);
  };

  const onSaveVideoType = (record: FanGroup) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelVideoType = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Video Types"
            subTitle="List of Video Types"
            extra={[
              <Button
                key="1"
                onClick={() => editFanGroup(filteredVideoTypes.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by Name"
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={filteredVideoTypes.length}
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
              dataSource={filteredVideoTypes}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <VideoTypeDetail
          videoType={currentVideoType}
          onSave={onSaveVideoType}
          onCancel={onCancelVideoType}
        />
      )}
    </>
  );
};

export default VideoTypes;
