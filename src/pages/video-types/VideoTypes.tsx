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
  const [videoTypes, setVideoTypes] = useState<VideoType[]>([]);
  const [filter, setFilter] = useState<string>('');

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
    if (!videoTypes.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = videoTypes.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setVideoTypes(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setVideoTypes([]);
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

      if (search(videoTypes).length < 10) setEof(true);
    }
  }, [details, videoTypes]);

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

  const search = rows => {
    return rows.filter(row => row.name.toLowerCase().indexOf(filter) > -1);
  };

  const refreshItem = (record: FanGroup) => {
    videoTypes[lastViewedIndex] = record;
    setVideoTypes([...videoTypes]);
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
              <Button key="1" onClick={() => editFanGroup(videoTypes.length)}>
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
            dataLength={videoTypes.length}
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
              dataSource={search(videoTypes)}
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
