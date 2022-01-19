import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Layout,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Tag as AntTag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import {
  deleteVideoFeed,
  fetchBrands,
  fetchCategories,
  fetchCreators,
  fetchVideoFeed,
  saveVideoFeed,
} from 'services/DiscoClubService';
import useFilter from 'hooks/useFilter';
import { Brand } from 'interfaces/Brand';
import '@pathofdev/react-tag-input/build/index.css';
import { Category } from 'interfaces/Category';
import { Creator } from 'interfaces/Creator';
import { useSelector } from 'react-redux';
import './VideoFeed.scss';
import './VideoFeedDetail.scss';
import scrollIntoView from 'scroll-into-view';
import SimpleSelect from 'components/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import VideoFeedDetailV2 from './VideoFeedDetailV2';
import { useRequest } from 'hooks/useRequest';

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = () => {
  const [selectedVideoFeed, setSelectedVideoFeed] = useState<FeedItem>();

  const {
    settings: { language = [] },
  } = useSelector((state: any) => state.settings);

  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [videoFeeds, setVideoFeeds] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();
  const [influencers, setInfluencers] = useState<Creator[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const { doRequest } = useRequest({ setLoading });

  const shouldUpdateFeedItemIndex = useRef(false);
  const originalFeedItemsIndex = useRef<Record<string, number | undefined>>({});
  const [updatingFeedItemIndex, setUpdatingFeedItemIndex] = useState<
    Record<string, boolean>
  >({});

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const {
    setArrayList: setFilteredItems,
    filteredArrayList: filteredItems,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<FeedItem>([]);

  useEffect(() => {
    getDetailsResources();
  }, []);

  useEffect(() => {
    feedForm.setFieldsValue(selectedVideoFeed);
    segmentForm.setFieldsValue(selectedVideoFeed);
  }, [selectedVideoFeed]);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const fetch = async (_brand?: Brand) => {
    setLoading(true);
    try {
      const response: any = await fetchVideoFeed();
      setLoading(false);
      setFilteredItems(response.results);
      setVideoFeeds(response.results);
    } catch (error) {
      message.error('Error to get feed');
      setLoading(false);
    }

    if (_brand) {
      addFilterFunction('brandName', feedItems =>
        feedItems.filter(feedItem => {
          if (!feedItem.package) return false;
          for (let i = 0; i < feedItem.package.length; i++) {
            if (feedItem.package[i].brands) {
              for (let j = 0; j < feedItem.package[i].brands.length; j++) {
                return (
                  feedItem.package[i].brands[j].brandName === _brand.brandName
                );
              }
            } else {
              return false;
            }
          }
        })
      );
    }
  };

  const getResources = (_brand?: Brand) => {
    fetch(_brand);
    setLoaded(true);
  };

  const getDetailsResources = async () => {
    async function getInfluencers() {
      const response: any = await fetchCreators();
      setInfluencers(response.results);
    }
    async function getCategories() {
      const response: any = await fetchCategories();
      setCategories(response.results);
    }
    async function getBrands() {
      setIsFetchingBrands(true);
      const response: any = await fetchBrands();
      setBrands(response.results);
      setIsFetchingBrands(false);
    }
    setLoading(true);
    await Promise.all([getInfluencers(), getCategories(), getBrands()]);
    setLoading(false);
  };

  const deleteItem = async (_id: string, index: number) => {
    setLoading(true);
    await deleteVideoFeed(_id);
    setFilteredItems(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
    setLoading(false);
  };

  const refreshItem = async (record: FeedItem) => {
    if (loaded) {
      videoFeeds[lastViewedIndex] = record;
      setFilteredItems([...videoFeeds]);
    } else {
      setFilteredItems([record]);
    }
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (loaded) {
      if (!_selectedBrand) {
        removeFilterFunction('brandName');
        return;
      }
      addFilterFunction('brandName', feedItems =>
        feedItems.filter(feedItem => {
          if (!feedItem.package) return false;
          for (let i = 0; i < feedItem.package.length; i++) {
            if (feedItem.package[i].brands) {
              for (let j = 0; j < feedItem.package[i].brands.length; j++) {
                return (
                  feedItem.package[i].brands[j].brandName ===
                  _selectedBrand.brandName
                );
              }
            } else {
              return false;
            }
          }
        })
      );
    } else {
      if (_selectedBrand) {
        getResources(_selectedBrand);
      } else {
        getResources();
      }
    }
  };

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterFeed = () => {
    return filteredItems.filter(item =>
      item.title?.toUpperCase().includes(filterText.toUpperCase())
    );
  };

  const onEditFeedItem = (index: number, videoFeed?: FeedItem) => {
    setLastViewedIndex(index);
    setSelectedVideoFeed(videoFeed);
    setDetails(true);
  };

  const onPageChange = (page: number) => {
    setCurrentPage(page);
  };
  const onCreatorChange = (key: string) => {
    const creator = influencers.find(influencer => influencer.id === key);
    const feedItem = feedForm.getFieldsValue(true) as FeedItem;

    const segments = feedItem.package.map(segment => {
      if (!segment.selectedOption || segment.selectedOption === 'creator') {
        segment.selectedFeedTitle = creator?.userName;
        segment.selectedIconUrl = creator?.avatar?.url || undefined;
      }
      return segment;
    });

    feedForm.setFieldsValue({
      package: [...segments],
      creator: creator,
    });
  };

  const onFeedItemIndexOnColumnChange = (
    feedItemIndex: number,
    feedItem: FeedItem
  ) => {
    for (let i = 0; i < filteredItems.length; i++) {
      if (filteredItems[i].id === feedItem.id) {
        if (originalFeedItemsIndex.current[feedItem.id] === undefined) {
          originalFeedItemsIndex.current[feedItem.id] = feedItem.index;
        }

        shouldUpdateFeedItemIndex.current =
          originalFeedItemsIndex.current[feedItem.id] !== feedItemIndex;

        filteredItems[i].index = feedItemIndex;
        setFilteredItems([...filteredItems]);
        break;
      }
    }
  };

  const onFeedItemIndexOnColumnBlur = async (feedItem: FeedItem) => {
    if (!shouldUpdateFeedItemIndex.current) {
      return;
    }
    setUpdatingFeedItemIndex(prev => {
      const newValue = {
        ...prev,
      };
      newValue[feedItem.id] = true;

      return newValue;
    });
    try {
      await saveVideoFeed(feedItem);
      message.success('Register updated with success.');
    } catch (err) {
      console.error(
        `Error while trying to update FeedItem[${feedItem.id}] index.`,
        err
      );
      message.success('Error while trying to update FeedItem index.');
    }
    setUpdatingFeedItemIndex(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[feedItem.id];
      return newValue;
    });
    delete originalFeedItemsIndex.current[feedItem.id];
    shouldUpdateFeedItemIndex.current = false;
  };

  const feedItemColumns: ColumnsType<FeedItem> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '3%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Index',
      dataIndex: 'index',
      width: '3%',
      render: (_, feedItem, index) => {
        if (updatingFeedItemIndex[feedItem.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              type="number"
              value={feedItem.index}
              onChange={feedItemIndex =>
                onFeedItemIndexOnColumnChange(feedItemIndex, feedItem)
              }
              onBlur={() => onFeedItemIndexOnColumnBlur(feedItem)}
            />
          );
        }
      },
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
    },
    {
      title: 'Segments',
      dataIndex: 'package',
      render: (pack: Array<any> = []) => <AntTag>{pack.length}</AntTag>,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Length',
      dataIndex: 'lengthTotal',
      width: '5%',
      align: 'center',
    },
    {
      title: 'Expiration Date',
      dataIndex: 'validity',
      width: '5%',
      render: (validity: Date) =>
        validity ? new Date(validity).toLocaleDateString() : '-',
      align: 'center',
    },
    {
      title: 'Tags',
      dataIndex: 'package',
      width: '5%',
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '12%',
      align: 'center',
      responsive: ['sm'],
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

  const onSaveItem = (record: FeedItem) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelItem = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div className="video-feed">
          <PageHeader
            title="Video feed update"
            subTitle="List of Feeds"
            extra={[
              <Button
                key="2"
                onClick={() => onEditFeedItem(filterFeed().length)}
              >
                New Item
              </Button>,
            ]}
          />
          <div style={{ marginBottom: '16px' }}>
            <Row align="bottom" justify="space-between">
              <Col lg={16} xs={24}>
                <Row gutter={8}>
                  <Col lg={8} xs={16}>
                    <Typography.Title level={5} title="Search">
                      Search
                    </Typography.Title>
                    <Input
                      onChange={onChangeFilter}
                      suffix={<SearchOutlined />}
                    />
                  </Col>
                  <Col lg={8} xs={16}>
                    <Typography.Title level={5}>Master Brand</Typography.Title>
                    <SimpleSelect
                      data={brands}
                      onChange={(_, brand) => onChangeBrand(brand)}
                      style={{ width: '100%' }}
                      selectedOption={''}
                      optionsMapping={optionsMapping}
                      placeholder={'Select a master brand'}
                      loading={isFetchingBrands}
                      disabled={isFetchingBrands}
                      allowClear={true}
                    ></SimpleSelect>
                  </Col>
                </Row>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={() => getResources()}
                  loading={loading}
                  style={{
                    marginRight: '25px',
                  }}
                >
                  Search
                  <SearchOutlined style={{ color: 'white' }} />
                </Button>
              </Col>
            </Row>
          </div>
          <Content>
            <Table
              rowClassName={(_, index) =>
                `scrollable-row-${index} ${
                  index === lastViewedIndex ? 'selected-row' : ''
                }`
              }
              size="small"
              columns={feedItemColumns}
              rowKey="id"
              dataSource={filterFeed()}
              loading={loading}
              pagination={{
                current: currentPage,
                onChange: onPageChange,
                pageSize: 50,
                pageSizeOptions: [
                  '50',
                  '100',
                  '200',
                  '300',
                  '400',
                  '500',
                  '1000',
                ],
              }}
            />
          </Content>
        </div>
      )}
      {details && (
        <VideoFeedDetailV2
          onSave={onSaveItem}
          onCancel={onCancelItem}
          feedItem={selectedVideoFeed}
          setFeedItem={setSelectedVideoFeed}
          brands={brands}
          categories={categories}
          influencers={influencers}
        />
      )}
    </>
  );
};

export default withRouter(VideoFeed);
