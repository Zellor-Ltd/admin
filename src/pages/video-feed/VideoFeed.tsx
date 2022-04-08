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
  fetchProductBrands,
  fetchVideoFeedV2,
  saveVideoFeed,
} from 'services/DiscoClubService';
import { Brand } from 'interfaces/Brand';
import '@pathofdev/react-tag-input/build/index.css';
import { Category } from 'interfaces/Category';
import { Creator } from 'interfaces/Creator';
import './VideoFeed.scss';
import './VideoFeedDetail.scss';
import scrollIntoView from 'scroll-into-view';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import VideoFeedDetailV2 from './VideoFeedDetailV2';
import {
  statusList,
  videoTypeList,
} from '../../components/select/select.utils';
import { ProductBrand } from '../../interfaces/ProductBrand';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from 'hooks/useRequest';
import useFilter from 'hooks/useFilter';

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = () => {
  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();
  const [selectedVideoFeed, setSelectedVideoFeed] = useState<FeedItem>();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<boolean>(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [influencers, setInfluencers] = useState<Creator[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [productBrands, setProductBrands] = useState([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filteredVideoFeeds, setFilteredVideoFeeds] = useState<any[]>([]);
  const { doFetch } = useRequest({ setLoading });
  const shouldUpdateFeedItemIndex = useRef(false);
  const originalFeedItemsIndex = useRef<Record<string, number | undefined>>({});
  const [updatingFeedItemIndex, setUpdatingFeedItemIndex] = useState<
    Record<string, boolean>
  >({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>();
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [productBrandFilter, setProductBrandFilter] = useState<ProductBrand>();
  const [categoryFilter, setCategoryFilter] = useState<Category>();
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>();
  const [titleFilter, setTitleFilter] = useState<string>();

  const {
    setArrayList: setFeedItems,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<FeedItem>([]);

  const masterBrandMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const productBrandMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const categoryMapping: SelectOption = {
    key: 'id',
    label: 'name',
    value: 'id',
  };

  const statusMapping: SelectOption = {
    key: 'value',
    label: 'value',
    value: 'value'.toLowerCase(),
  };

  const videoTypeMapping: SelectOption = {
    key: 'value',
    label: 'value',
    value: 'value',
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredVideoFeeds([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  const fetchData = async () => {
    if (!filteredContent.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredVideoFeeds(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  const onChangeStatus = async (_status?: string) => {
    if (!_status) {
      removeFilterFunction('status');
      setRefreshing(true);
      return;
    }
    if (filteredContent.length) setFilteredVideoFeeds(filteredContent);
    addFilterFunction('status', items =>
      items.filter(feedItem => feedItem.status === _status)
    );
    setStatusFilter(_status);
    setRefreshing(true);
  };

  const onChangeVideoType = async (_videoType?: string) => {
    if (!_videoType) {
      removeFilterFunction('videotype');
      setRefreshing(true);
      return;
    }
    if (filteredContent.length) setFilteredVideoFeeds(filteredContent);
    addFilterFunction('videoType', items =>
      items.filter(feedItem => feedItem.videoType?.includes(_videoType))
    );
    setVideoTypeFilter(_videoType);
    setRefreshing(true);
  };

  const onChangeProductBrand = async (
    _productBrandId?: string,
    _productBrand?: ProductBrand
  ) => {
    if (!_productBrandId) {
      removeFilterFunction('id');
      setRefreshing(true);
      return;
    }
    if (filteredContent.length) setFilteredVideoFeeds(filteredContent);
    addFilterFunction('id', items =>
      items.filter(feedItem => feedItem.id === _productBrandId)
    );
    setProductBrandFilter(_productBrand);
    setRefreshing(true);
  };

  const onChangeCategory = async (
    _categoryid?: string,
    _category?: Category
  ) => {
    if (!_categoryid) {
      removeFilterFunction('id');
      setRefreshing(true);
      return;
    }
    if (filteredContent.length) setFilteredVideoFeeds(filteredContent);
    addFilterFunction('id', items =>
      items.filter(feedItem => feedItem.category === _categoryid)
    );
    setCategoryFilter(_category);
    setRefreshing(true);
  };

  const onChangeStartIndex = async (_startIndex?: number) => {
    if (!_startIndex) {
      removeFilterFunction('index');
      setRefreshing(true);
      return;
    }
    if (filteredContent.length) setFilteredVideoFeeds(filteredContent);
    addFilterFunction('index', items =>
      items.filter(feedItem => feedItem.index === _startIndex)
    );
    setRefreshing(true);
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
      render: (_, feedItem) => {
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

  const fetch = async () => {
    try {
      const { results }: any = await doFetch(() =>
        fetchVideoFeedV2({
          query: titleFilter,
          brandId: brandFilter?.id,
        })
      );
      setFeedItems(results);
      if (statusFilter) onChangeStatus(statusFilter);
      // TODO convert these into calls
      // const [brandFilter, setBrandFilter] = useState<Brand>();
      // const [productBrandFilter, setProductBrandFilter] = useState<ProductBrand>();
      // const [categoryFilter, setCategoryFilter] = useState<Category>();
      // const [videoTypeFilter, setVideoTypeFilter] = useState<string>();
      // const [titleFilter, setTitleFilter] = useState<string>();
      setRefreshing(true);
      setLoaded(true);
    } catch (error) {
      message.error('Error to get feed');
    }
  };

  const getDetailsResources = async () => {
    async function getInfluencers() {
      const response: any = await fetchCreators();
      setInfluencers(response.results);
    }
    async function getCategories() {
      setIsFetchingCategories(true);
      const response: any = await fetchCategories();
      setCategories(response.results);
      setIsFetchingCategories(false);
    }
    async function getBrands() {
      setIsFetchingBrands(true);
      const response: any = await fetchBrands();
      setBrands(response.results);
      setIsFetchingBrands(false);
    }
    async function getProductBrands() {
      setIsFetchingProductBrands(true);
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
      setIsFetchingProductBrands(false);
    }
    await Promise.all([
      getInfluencers(),
      getCategories(),
      getBrands(),
      getProductBrands(),
    ]);
  };

  const deleteItem = async (_id: string, index: number) => {
    await deleteVideoFeed(_id);
    setFeedItems(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    setRefreshing(true);
  };

  const refreshItem = (record: FeedItem) => {
    if (loaded) {
      filteredVideoFeeds[lastViewedIndex] = record;
      setFeedItems([...filteredVideoFeeds]);
    } else {
      setFeedItems([record]);
    }
    setRefreshing(true);
  };

  const onEditFeedItem = (index: number, videoFeed?: FeedItem) => {
    setLastViewedIndex(index);
    setSelectedVideoFeed(videoFeed);
    setDetails(true);
  };

  const onFeedItemIndexOnColumnChange = (
    feedItemIndex: number,
    feedItem: FeedItem
  ) => {
    for (let i = 0; i < filteredVideoFeeds.length; i++) {
      if (filteredVideoFeeds[i].id === feedItem.id) {
        if (originalFeedItemsIndex.current[feedItem.id] === undefined) {
          originalFeedItemsIndex.current[feedItem.id] = feedItem.index;
        }

        shouldUpdateFeedItemIndex.current =
          originalFeedItemsIndex.current[feedItem.id] !== feedItemIndex;

        filteredVideoFeeds[i].index = feedItemIndex;
        setFeedItems([...filteredVideoFeeds]);
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
      hCreationDate: '',
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
            title="Video feed update"
            subTitle="List of Feeds"
            extra={[
              <Button
                key="2"
                onClick={() => onEditFeedItem(filteredVideoFeeds.length - 1)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row
            align="bottom"
            justify="space-between"
            gutter={[8, 8]}
            className={'sticky-filter-box'}
          >
            <Col lg={24} xs={24}>
              <Row gutter={8}>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5} title="Search">
                    Search
                  </Typography.Title>
                  <Input
                    onChange={event => setTitleFilter(event.target.value)}
                    suffix={<SearchOutlined />}
                    value={titleFilter}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <SimpleSelect
                    data={brands}
                    onChange={(_, brand) => setBrandFilter(brand)}
                    style={{ width: '100%' }}
                    selectedOption={brandFilter?.id}
                    optionsMapping={masterBrandMapping}
                    placeholder={'Select a master brand'}
                    loading={isFetchingBrands}
                    disabled={isFetchingBrands}
                    allowClear={true}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Product Brand</Typography.Title>
                  <SimpleSelect
                    data={productBrands}
                    onChange={(id, productBrand) =>
                      onChangeProductBrand(id, productBrand)
                    }
                    style={{ width: '100%' }}
                    selectedOption={productBrandFilter?.id}
                    optionsMapping={productBrandMapping}
                    placeholder={'Select a product brand'}
                    loading={isFetchingProductBrands}
                    disabled={isFetchingProductBrands}
                    allowClear={true}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Status</Typography.Title>
                  <SimpleSelect
                    data={statusList}
                    onChange={status => onChangeStatus(status)}
                    style={{ width: '100%' }}
                    selectedOption={statusFilter}
                    optionsMapping={statusMapping}
                    placeholder={'Select a status'}
                    allowClear={true}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Category</Typography.Title>
                  <SimpleSelect
                    data={categories}
                    onChange={(id, category) => onChangeCategory(id, category)}
                    style={{ width: '100%' }}
                    selectedOption={categoryFilter?.id}
                    optionsMapping={categoryMapping}
                    placeholder={'Select a category'}
                    allowClear={true}
                    loading={isFetchingCategories}
                    disabled={isFetchingCategories}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Video Type</Typography.Title>
                  <SimpleSelect
                    data={videoTypeList}
                    onChange={videoType => onChangeVideoType(videoType)}
                    style={{ width: '100%' }}
                    selectedOption={videoTypeFilter}
                    optionsMapping={videoTypeMapping}
                    placeholder={'Select a video type'}
                    allowClear={true}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Start Index</Typography.Title>
                  <InputNumber
                    min={0}
                    onChange={startIndex => onChangeStartIndex(startIndex)}
                  />
                </Col>
              </Row>
            </Col>
            <Col lg={24} xs={24}>
              <Row justify="end">
                <Button type="primary" onClick={fetch} loading={loading}>
                  Search
                  <SearchOutlined style={{ color: 'white' }} />
                </Button>
              </Row>
            </Col>
          </Row>
          <Content>
            <InfiniteScroll
              dataLength={filteredVideoFeeds.length}
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
                rowClassName={(_, index) =>
                  `scrollable-row-${index} ${
                    index === lastViewedIndex ? 'selected-row' : ''
                  }`
                }
                size="small"
                columns={feedItemColumns}
                rowKey="id"
                dataSource={filteredVideoFeeds}
                loading={loading || refreshing}
                pagination={false}
              />
            </InfiniteScroll>
          </Content>
        </div>
      )}
      {details && (
        <VideoFeedDetailV2
          onSave={onSaveItem}
          onCancel={onCancelItem}
          feedItem={selectedVideoFeed}
          brands={brands}
          categories={categories}
          influencers={influencers}
          productBrands={productBrands}
          isFetchingProductBrand={isFetchingProductBrands}
        />
      )}
    </>
  );
};

export default withRouter(VideoFeed);
