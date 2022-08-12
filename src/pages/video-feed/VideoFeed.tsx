/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
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
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
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
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import VideoFeedDetailV2 from './VideoFeedDetailV2';
import { statusList, videoTypeList } from 'components/select/select.utils';
import { useRequest } from 'hooks/useRequest';
import moment from 'moment';
import scrollIntoView from 'scroll-into-view';

const { Content } = Layout;
const { Panel } = Collapse;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages?.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = () => {
  const inputRef = useRef<any>(null);
  const [activeKey, setActiveKey] = useState<string>('0');
  const [feedForm] = Form.useForm();
  const [segmentForm] = Form.useForm();
  const selectedFeedItem = useRef<FeedItem>();
  const [details, setDetails] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const loaded = useRef<boolean>(false);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const { doFetch } = useRequest({ setLoading });
  const shouldUpdateFeedItemIndex = useRef(false);
  const [updatingFeedItemIndex, setUpdatingFeedItemIndex] =
    useState<boolean>(false);

  const creators = useRef<Creator[]>([]);
  const categories = useRef<Category[]>([]);
  const brands = useRef<Brand[]>([]);
  const productBrands = useRef<any[]>([]);

  const [resources, setResources] = useState<{
    creators: Creator[];
    categories: Category[];
    brands: Brand[];
    productBrands: any[];
  }>({
    creators: [],
    categories: [],
    brands: [],
    productBrands: [],
  });

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>();
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [productBrandFilter, setProductBrandFilter] = useState<string>();
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>();
  const [titleFilter, setTitleFilter] = useState<string>();
  const [categoryFilter, setCategoryFilter] = useState<string>();
  const [indexFilter, setIndexFilter] = useState<number>();
  const [creatorFilter, setCreatorFilter] = useState<string>();
  const [dateSortFilter, setDateSortFilter] = useState<string>();
  const [panelOffset, setPanelOffset] = useState<number>(64);
  const panelHeight = useRef<number>();
  const flag1 = useRef<boolean>(false);
  const flag2 = useRef<boolean>(false);
  const isMounted = useRef<boolean>(false);
  const windowHeight = window.innerHeight;

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
    value: 'value'?.toUpperCase(),
  };

  const videoTypeMapping: SelectOption = {
    key: 'value',
    label: 'value',
    value: 'value',
  };

  const { isMobile } = useContext(AppContext);

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
                onIndexChange(feedItemIndex, feedItem, index)
              }
              onBlur={() => onIndexBlur(feedItem)}
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
      render: (_: string, item: FeedItem) => (
        <Link
          onClick={() =>
            window
              .open(
                item.package?.find(item => item.shareLink)?.shareLink,
                '_blank'
              )
              ?.focus()
          }
          to={{ pathname: window.location.pathname }}
        >
          {item.package?.find(item => item.shareLink)?.shareLink ?? ''}
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
    if (!isMounted.current) isMounted.current = true;
  });

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.focus({
        cursor: 'end',
      });
  }, [titleFilter]);

  useEffect(() => {
    // Code for Safari 3.1 to 6.0
    document
      .getElementById('filterPanel')!
      .addEventListener('webkitTransitionEnd', handleResize);
    // Standard syntax
    document
      .getElementById('filterPanel')!
      .addEventListener('transitionend', handleResize);
  });

  const handleResize = () => {
    panelHeight.current = document.getElementById('filterPanel')!.offsetHeight;
  };

  //following useEffects make sure both activeKey and panelHeight have been updated before setting offset
  //between renderings they have been updated in different orders.
  useEffect(() => {
    if (!isMounted.current) return;
    flag1.current = true;
    if (flag2.current) updatePanelOffset();
  }, [activeKey]);

  useEffect(() => {
    if (!isMounted.current) return;
    flag2.current = true;
    if (flag1.current) updatePanelOffset();
  }, [panelHeight.current]);

  const updatePanelOffset = () => {
    if (flag1.current && flag2.current) {
      if (activeKey === '1') {
        if (panelHeight.current! > windowHeight) {
          const heightDifference = panelHeight.current! - windowHeight;
          const quarterWindowHeight = windowHeight / 4;
          setPanelOffset(-heightDifference - quarterWindowHeight);
        }
      } else setPanelOffset(64);
    }
    flag1.current = false;
    flag2.current = false;
  };

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  const fetch = async (event?: any) => {
    try {
      if (event) onCollapse(event);
      scrollToCenter(0);
      const { results }: any = await doFetch(() =>
        fetchVideoFeedV2({
          query: titleFilter,
          brandId: brandFilter?.id,
          status: statusFilter?.toUpperCase(),
          videoType: videoTypeFilter,
          productBrandId: productBrandFilter,
          dateSort: dateSortFilter,
        })
      );
      setFeedItems(results);
      loaded.current = true;
    } catch (error) {
      message.error('Error to get feed');
    }
  };

  const getDetailsResources = async () => {
    setLoading(true);
    async function getCreators() {
      const response: any = await fetchCreators({
        query: '',
      });
      creators.current = response.results;
    }
    async function getCategories() {
      const response: any = await fetchCategories();
      categories.current = response.results;
    }
    async function getBrands() {
      const response: any = await fetchBrands();
      brands.current = response.results;
    }
    async function getProductBrands() {
      const response: any = await fetchProductBrands();
      productBrands.current = response.results;
    }
    await Promise.all([
      getCreators(),
      getCategories(),
      getBrands(),
      getProductBrands(),
    ]).then(() => {
      setResources({
        creators: creators.current,
        categories: categories.current,
        brands: brands.current,
        productBrands: productBrands.current,
      });
      setLoading(false);
    });
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

  const refreshItem = (item: FeedItem) => {
    if (loaded.current) {
      feedItems[lastViewedIndex] = item;
      setFeedItems([...feedItems]);
    } else {
      setFeedItems([item]);
    }
  };

  const onEditFeedItem = (index: number, item?: FeedItem) => {
    setLastViewedIndex(index);

    if (item && !item.index) item!.index = 1000;
    selectedFeedItem.current = item;
    feedForm.setFieldsValue(item);
    segmentForm.setFieldsValue(item);

    setDetails(true);
  };

  const onIndexChange = (value: number, item: FeedItem, index: number) => {
    shouldUpdateFeedItemIndex.current = item.index! !== value;

    feedItems[index].index = value;
    setFeedItems([...feedItems]);
  };

  const onIndexBlur = async (item: FeedItem) => {
    if (!shouldUpdateFeedItemIndex.current) {
      return;
    }
    setUpdatingFeedItemIndex(true);
    try {
      await saveVideoFeed(item);
      message.success('Register updated with success.');
    } catch (err) {
      console.error(`Error while trying to update index.`, err);
    }
    setUpdatingFeedItemIndex(false);
    shouldUpdateFeedItemIndex.current = false;
  };

  const onSaveItem = (item: FeedItem) => {
    refreshItem(item);
    setDetails(false);
    feedForm.resetFields();
    segmentForm.resetFields();
    selectedFeedItem.current = undefined;
  };

  const onCancelItem = () => {
    setDetails(false);
  };

  const Filters = () => {
    return (
      <>
        <Col lg={20} xs={24}>
          <Row gutter={[8, 8]}>
            <Col lg={5} xs={24}>
              <Typography.Title level={5} title="Title">
                Title
              </Typography.Title>
              <Input
                ref={inputRef}
                onChange={event => setTitleFilter(event.target.value)}
                suffix={<SearchOutlined />}
                value={titleFilter}
                placeholder="Search by Title"
                onPressEnter={fetch}
                disabled={loading}
              />
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Master Brand</Typography.Title>
              <SimpleSelect
                data={resources.brands}
                onChange={(_, brand) => setBrandFilter(brand)}
                style={{ width: '100%' }}
                selectedOption={brandFilter?.id}
                optionMapping={masterBrandMapping}
                placeholder={'Select a Master Brand'}
                loading={loading}
                disabled={loading}
                allowClear={true}
              />
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Product Brand</Typography.Title>
              <SimpleSelect
                data={resources.productBrands}
                onChange={id => setProductBrandFilter(id as any)}
                style={{ width: '100%' }}
                selectedOption={productBrandFilter}
                optionMapping={productBrandMapping}
                placeholder={'Select a Product Brand'}
                loading={loading}
                disabled={loading}
                allowClear={true}
              />
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Status</Typography.Title>
              <SimpleSelect
                data={statusList}
                onChange={status => setStatusFilter(status)}
                style={{ width: '100%' }}
                selectedOption={statusFilter}
                optionMapping={statusMapping}
                placeholder={'Select a Status'}
                loading={loading}
                disabled={loading}
                allowClear={true}
              />
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Category</Typography.Title>
              <SimpleSelect
                data={resources.categories}
                onChange={(_, category) =>
                  setCategoryFilter(category?.name ?? '')
                }
                style={{ width: '100%' }}
                selectedOption={categoryFilter}
                optionMapping={categoryMapping}
                placeholder={'Select a Category'}
                allowClear={true}
                loading={loading}
                disabled={loading}
              />
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Video Type</Typography.Title>
              <SimpleSelect
                data={videoTypeList}
                onChange={videoType => setVideoTypeFilter(videoType)}
                style={{ width: '100%' }}
                selectedOption={videoTypeFilter}
                optionMapping={videoTypeMapping}
                placeholder={'Select a Video Type'}
                loading={loading}
                disabled={loading}
                allowClear={true}
              />
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Start Index</Typography.Title>
              <InputNumber
                min={0}
                onChange={startIndex => setIndexFilter(startIndex ?? undefined)}
                placeholder="Select an Index"
                disabled={loading}
              />
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Creator</Typography.Title>
              <Select
                placeholder="Select a Creator"
                onChange={setCreatorFilter}
                style={{ width: '100%' }}
                filterOption={(input, option) =>
                  !!option?.children
                    ?.toString()
                    ?.toUpperCase()
                    .includes(input?.toUpperCase())
                }
                loading={loading}
                disabled={loading}
                allowClear={true}
                showSearch={true}
              >
                {resources.creators.map((curr: any) => (
                  <Select.Option
                    key={curr.id}
                    value={curr.firstName}
                    label={curr.firstName}
                  >
                    {curr.firstName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col lg={5} xs={24}>
              <Typography.Title level={5}>Date Sort</Typography.Title>
              <Select
                onChange={setDateSortFilter}
                placeholder="Select a Sorting Option"
                style={{ width: '100%' }}
                filterOption={(input, option) =>
                  !!option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                loading={loading}
                disabled={loading}
                allowClear={true}
                showSearch={true}
              >
                <Select.Option
                  key="newestFirst"
                  value="Newest First"
                  label="Newest First"
                >
                  Newest First
                </Select.Option>
                <Select.Option
                  key="oldestFirst"
                  value="Oldest First"
                  label="Oldest First"
                >
                  Oldest First
                </Select.Option>
                <Select.Option key="none" value="None" label="None">
                  None
                </Select.Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </>
    );
  };

  const onCollapse = (event?: any) => {
    if (event && isMobile) {
      if (activeKey === '1') setActiveKey('0');
    }
  };

  const handleCollapseChange = () => {
    if (activeKey === '1') setActiveKey('0');
    else setActiveKey('1');
  };

  return (
    <>
      {!details && (
        <div className="video-feed mb-1">
          <PageHeader
            title="Video Feeds"
            subTitle={isMobile ? '' : 'List of Feeds'}
            className={isMobile ? 'mb-n1' : ''}
            extra={[
              <Button
                key="2"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => onEditFeedItem(feedItems.length - 1)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box"
            id="filterPanel"
            style={{ top: panelOffset }}
          >
            {!isMobile && <Filters />}
            {isMobile && (
              <Collapse
                ghost
                activeKey={activeKey}
                onChange={handleCollapseChange}
                destroyInactivePanel
              >
                <Panel
                  header={<Typography.Title level={5}>Filter</Typography.Title>}
                  key="1"
                >
                  <div id="expanded">
                    <Filters />
                  </div>
                </Panel>
              </Collapse>
            )}
            <Col span={24}>
              <Row justify="space-between" align="top" className="mb-1 mt-1">
                <Col flex="auto">
                  <Button
                    type="text"
                    onClick={onCollapse}
                    style={{
                      display: activeKey === '1' ? 'block' : 'none',
                      background: 'none',
                    }}
                  >
                    <UpOutlined />
                  </Button>
                </Col>
                <Button type="primary" onClick={fetch} loading={loading}>
                  Search
                  <SearchOutlined style={{ color: 'white' }} />
                </Button>
              </Row>
            </Col>
          </Row>
          <Content>
            <Table
              scroll={{ x: true }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
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
          feedItem={selectedFeedItem.current}
          brands={resources.brands}
          creators={resources.creators}
          productBrands={resources.productBrands}
          isFetchingProductBrand={loading}
          setDetails={setDetails}
        />
      )}
    </>
  );
};

export default withRouter(VideoFeed);
