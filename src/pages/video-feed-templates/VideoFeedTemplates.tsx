import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Form,
  Layout,
  message,
  PageHeader,
  Popconfirm,
  Table,
  Tag as AntTag,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  deleteVideoFeed,
  fetchBrands,
  fetchCreators,
  fetchProductBrands,
  fetchVideoFeedV2,
} from 'services/DiscoClubService';
import { Brand } from 'interfaces/Brand';
import '@pathofdev/react-tag-input/build/index.css';
import { Creator } from 'interfaces/Creator';
import '../video-feed/VideoFeed.scss';
import '../video-feed/VideoFeedDetail.scss';
import VideoFeedDetailV2 from '../video-feed/VideoFeedDetailV2';
import { useRequest } from 'hooks/useRequest';
import moment from 'moment';

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeedTemplates: React.FC<RouteComponentProps> = () => {
  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();
  const [selectedVideoFeed, setSelectedVideoFeed] = useState<FeedItem>();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<boolean>(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [productBrands, setProductBrands] = useState([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const { doFetch } = useRequest({ setLoading });

  useEffect(() => {
    fetch();
  });

  const feedItemColumns: ColumnsType<FeedItem> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '3%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: '18%',
      render: (value: string, feedItem: FeedItem, index: number) => (
        <Link
          onClick={() => onEditFeedItem(index, feedItem)}
          to={{ pathname: window.location.pathname, state: feedItem }}
        >
          {value}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.title && b.title) return a.title.localeCompare(b.title as string);
        else if (a.title) return -1;
        else if (b.title) return 1;
        else return 0;
      },
    },
    {
      title: 'Creation Date',
      dataIndex: 'hCreationDate',
      width: '10%',
      render: (creation: Date) =>
        creation
          ? new Date(creation).toLocaleDateString('en-GB') +
            ' ' +
            new Date(creation).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.hCreationDate && b.hCreationDate)
          return (
            moment(a.hCreationDate as Date).unix() -
            moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
      },
    },
    {
      title: 'Tags',
      dataIndex: 'package',
      width: '5%',
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: 'center',
      sorter: (a, b): any => {
        if (a.package && b.package)
          return reduceSegmentsTags(a.package) - reduceSegmentsTags(b.package);
        else if (a.package) return -1;
        else if (b.package) return 1;
        else return 0;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
      sorter: (a, b): any => {
        if (a.status && b.status)
          return a.status.localeCompare(b.status as string);
        else if (a.status) return -1;
        else if (b.status) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, feedItem: FeedItem, index: number) => (
        <>
          <Link
            onClick={() => onEditFeedItem(index, feedItem)}
            to={{ pathname: window.location.pathname, state: feedItem }}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(feedItem.id, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  useEffect(() => {
    getDetailsResources();
  }, []);

  useEffect(() => {
    if (selectedVideoFeed) {
      selectedVideoFeed.index =
        selectedVideoFeed?.index !== undefined
          ? selectedVideoFeed?.index
          : 1000;
    }
    feedForm.setFieldsValue(selectedVideoFeed);
    segmentForm.setFieldsValue(selectedVideoFeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideoFeed]);

  const fetch = async () => {
    try {
      const { results }: any = await doFetch(() =>
        fetchVideoFeedV2({
          query: undefined,
          brandId: undefined,
          status: undefined,
          videoType: undefined,
          productBrandId: undefined,
        })
      );
      setFeedItems(results);
      setLoaded(true);
    } catch (error) {
      message.error('Error to get feed');
    }
  };

  const getDetailsResources = async () => {
    async function getcreators() {
      const response: any = await fetchCreators({
        query: '',
      });
      setCreators(response.results);
    }
    async function getBrands() {
      const response: any = await fetchBrands();
      setBrands(response.results);
    }
    async function getProductBrands() {
      setIsFetchingProductBrands(true);
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
      setIsFetchingProductBrands(false);
    }
    await Promise.all([getcreators(), getBrands(), getProductBrands()]);
  };

  const deleteItem = async (_id: string, index: number) => {
    await deleteVideoFeed(_id);
    setFeedItems(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const refreshItem = (record: FeedItem) => {
    if (loaded) {
      feedItems[lastViewedIndex] = record;
      setFeedItems([...feedItems]);
    } else {
      setFeedItems([record]);
    }
  };

  const onEditFeedItem = (index: number, videoFeed?: FeedItem) => {
    setLastViewedIndex(index);
    setSelectedVideoFeed(videoFeed);
    setDetails(true);
  };

  const onSaveItem = (record: FeedItem) => {
    refreshItem(record);
    setDetails(false);
    resetForm();
  };

  const onCancelItem = () => {
    setDetails(false);
  };

  const resetForm = () => {
    const template = {
      category: '',
      creator: {
        id: '',
        status: '',
        userName: '',
        creatorId: '',
        firstName: '',
        lastName: '',
      },
      description: '',
      format: '',
      gender: [],
      goLiveDate: '',
      hCreationDate: undefined,
      hLastUpdate: '',
      id: '',
      language: '',
      package: [],
      shortDescription: '',
      status: '',
      title: '',
      validity: '',
      videoType: [],
      video: {},
      lengthTotal: 0,
      market: '',
      modelRelease: '',
      target: '',
      _id: '',
      selectedOption: 'productBrand' as any,
      selectedId: '',
      selectedIconUrl: '',
      selectedselectedFeedTitle: '',
    };
    setSelectedVideoFeed(template);
  };

  return (
    <>
      {!details && (
        <div className="video-feed mb-1">
          <PageHeader
            title="Video Feeds"
            subTitle="List of Feeds"
            extra={[
              <Button
                key="2"
                onClick={() => onEditFeedItem(feedItems.length - 1)}
              >
                New Item
              </Button>,
            ]}
          />
          <Content>
            <Table
              rowClassName={(_, index) =>
                `${index === lastViewedIndex ? 'selected-row' : ''}`
              }
              size="small"
              columns={feedItemColumns}
              rowKey="id"
              dataSource={feedItems}
              loading={loading}
            />
          </Content>
        </div>
      )}
      {details && (
        <VideoFeedDetailV2
          onSave={onSaveItem}
          onCancel={onCancelItem}
          feedItem={selectedVideoFeed}
          brands={brands}
          creators={creators}
          productBrands={productBrands}
          isFetchingProductBrand={isFetchingProductBrands}
          setDetails={setDetails}
        />
      )}
    </>
  );
};

export default withRouter(VideoFeedTemplates);
