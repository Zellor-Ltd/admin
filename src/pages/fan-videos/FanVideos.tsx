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
  Select,
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
import 'pages/video-feed/VideoFeed.scss';
import 'pages/video-feed/VideoFeedDetail.scss';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import VideoFeedDetailV2 from 'pages/video-feed/VideoFeedDetailV2';
import { statusList, videoTypeList } from 'components/select/select.utils';
import { useRequest } from 'hooks/useRequest';
import moment from 'moment';

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages?.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const FanVideos: React.FC<RouteComponentProps> = () => {
  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();
  const [selectedVideoFeed, setSelectedVideoFeed] = useState<FeedItem>();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<boolean>(false);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [productBrands, setProductBrands] = useState([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const { doFetch } = useRequest({ setLoading });
  const shouldUpdateFeedItemIndex = useRef(false);
  const originalFeedItemsIndex = useRef<Record<string, number | undefined>>({});
  const [updatingFeedItemIndex, setUpdatingFeedItemIndex] = useState<
    Record<string, boolean>
  >({});

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>();
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [productBrandFilter, setProductBrandFilter] = useState<string>();
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>();
  const [titleFilter, setTitleFilter] = useState<string>();
  const [categoryFilter, setCategoryFilter] = useState<string>();
  const [indexFilter, setIndexFilter] = useState<number>();
  const [creatorFilter, setCreatorFilter] = useState<string>();

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
    value: 'value'.toUpperCase(),
  };

  const videoTypeMapping: SelectOption = {
    key: 'value',
    label: 'value',
    value: 'value',
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
      sorter: (a, b): any => {
        if (a.index && b.index) return a.index - b.index;
        else if (a.index) return -1;
        else if (b.index) return 1;
        else return 0;
      },
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
      title: 'Segments',
      dataIndex: 'package',
      render: (pack: Array<any> = []) => <AntTag>{pack?.length ?? 0}</AntTag>,
      width: '5%',
      align: 'center',
    },
    {
      title: 'Length',
      dataIndex: 'lengthTotal',
      width: '5%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.lengthTotal && b.lengthTotal)
          return a.lengthTotal - b.lengthTotal;
        else if (a.lengthTotal) return -1;
        else if (b.lengthTotal) return 1;
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
      title: 'InstaLink',
      width: '18%',
      render: (_: string, record: FeedItem) => (
        <Link
          onClick={() =>
            window
              .open(
                record.package?.find(item => item.shareLink)?.shareLink,
                '_blank'
              )
              ?.focus()
          }
          to={{ pathname: window.location.pathname }}
        >
          {record.package?.find(item => item.shareLink)?.shareLink ?? ''}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.package && b.package) {
          const linkA = a.package.find(item => item.shareLink)?.shareLink;
          const linkB = b.package.find(item => item.shareLink)?.shareLink;
          if (linkA && linkB) return linkA.localeCompare(linkB);
          else if (linkA) return -1;
          else if (linkB) return 1;
          else return 0;
        } else if (a.package?.find(item => item.shareLink)?.shareLink)
          return -1;
        else if (b.package?.find(item => item.shareLink)?.shareLink) return 1;
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
  }, [selectedVideoFeed]);

  const fetch = async () => {
    try {
      const { results }: any = await doFetch(() =>
        fetchVideoFeedV2({
          query: titleFilter,
          brandId: brandFilter?.id,
          status: statusFilter?.toUpperCase(),
          videoType: 'Fan',
          productBrandId: productBrandFilter,
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
      getcreators(),
      getCategories(),
      getBrands(),
      getProductBrands(),
    ]);
  };

  const search = rows => {
    let updatedRows = rows;
    if (indexFilter) {
      updatedRows = updatedRows.filter(row => {
        return row.index && row.index === indexFilter;
      });
    }
    if (creatorFilter) {
      updatedRows = updatedRows.filter(
        row => row?.creator?.firstName?.indexOf(creatorFilter) > -1
      );
    }
    if (categoryFilter) {
      updatedRows = updatedRows.filter(
        row => row.category?.indexOf(categoryFilter) > -1
      );
    }
    return updatedRows;
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

  const onFeedItemIndexOnColumnChange = (
    feedItemIndex: number,
    feedItem: FeedItem
  ) => {
    for (let i = 0; i < feedItems.length; i++) {
      if (feedItems[i].id === feedItem.id) {
        if (originalFeedItemsIndex.current[feedItem.id] === undefined) {
          originalFeedItemsIndex.current[feedItem.id] = feedItem.index;
        }

        shouldUpdateFeedItemIndex.current =
          originalFeedItemsIndex.current[feedItem.id] !== feedItemIndex;

        feedItems[i].index = feedItemIndex;
        setFeedItems([...feedItems]);
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
            title="Fan Videos"
            extra={[
              <Button
                key="2"
                onClick={() => onEditFeedItem(feedItems.length - 1)}
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
                    placeholder="Type to search by title"
                    onPressEnter={fetch}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <SimpleSelect
                    data={brands}
                    onChange={(_, brand) => setBrandFilter(brand)}
                    style={{ width: '100%' }}
                    selectedOption={brandFilter?.id}
                    optionMapping={masterBrandMapping}
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
                    onChange={id => setProductBrandFilter(id as any)}
                    style={{ width: '100%' }}
                    selectedOption={productBrandFilter}
                    optionMapping={productBrandMapping}
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
                    onChange={status => setStatusFilter(status)}
                    style={{ width: '100%' }}
                    selectedOption={statusFilter}
                    optionMapping={statusMapping}
                    placeholder={'Select a status'}
                    allowClear={true}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Category</Typography.Title>
                  <SimpleSelect
                    data={categories}
                    onChange={(_, category) =>
                      setCategoryFilter(category?.name ?? '')
                    }
                    style={{ width: '100%' }}
                    selectedOption={categoryFilter}
                    optionMapping={categoryMapping}
                    placeholder={'Select a category'}
                    allowClear={true}
                    loading={isFetchingCategories}
                    disabled={isFetchingCategories}
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Start Index</Typography.Title>
                  <InputNumber
                    min={0}
                    onChange={startIndex =>
                      setIndexFilter(startIndex ?? undefined)
                    }
                    placeholder="Select an index"
                  />
                </Col>
                <Col lg={4} xs={12}>
                  <Typography.Title level={5}>Creator</Typography.Title>
                  <Select
                    placeholder="Select a creator"
                    disabled={!creators.length}
                    onChange={setCreatorFilter}
                    style={{ width: '100%' }}
                  >
                    {creators.map((curr: any) => (
                      <Select.Option key={curr.id} value={curr.firstName}>
                        {curr.firstName}
                      </Select.Option>
                    ))}
                  </Select>
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
            <Table
              rowClassName={(_, index) =>
                `${index === lastViewedIndex ? 'selected-row' : ''}`
              }
              size="small"
              columns={feedItemColumns}
              rowKey="id"
              dataSource={search(feedItems)}
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
          isFanVideo
        />
      )}
    </>
  );
};

export default withRouter(FanVideos);
