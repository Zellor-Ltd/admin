/* eslint-disable react-hooks/exhaustive-deps */
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  ProfileOutlined,
  RedoOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
  Input,
  InputNumber,
  message as msg,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
  Tag as AntTag,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { FeedItem } from 'interfaces/FeedItem';
import { Segment } from 'interfaces/Segment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import {
  Link,
  RouteComponentProps,
  useHistory,
  withRouter,
} from 'react-router-dom';
import {
  deleteVideoFeed,
  fetchBrands,
  fetchCategories,
  fetchProductBrands,
  fetchVideoFeedV3,
  propagateVLink,
  addFeaturedFeed,
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
import VideoFeedDetail from './VideoFeedDetail';
import { statusList, videoTypeList } from 'components/select/select.utils';
import scrollIntoView from 'scroll-into-view';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useSelector } from 'react-redux';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';

const { Panel } = Collapse;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages?.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = () => {
  const {
    settings: { feedList = [] },
  } = useSelector((state: any) => state.settings);
  const { isMobile, setisScrollable } = useContext(AppContext);
  const inputRef = useRef<any>(null);
  const [activeKey, setActiveKey] = useState<string>('1');
  const [selectedVideoFeed, setSelectedVideoFeed] = useState<FeedItem>();
  const [loading, setLoading] = useState(false);
  const [loadingRow, setLoadingRow] = useState<string>("");
  const loaded = useRef<boolean>(false);
  const [loadingResources, setLoadingResources] = useState<boolean>(true);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState([]);
  const [list, setList] = useState([]);
  const [buffer, setBuffer] = useState<any[]>([]);
  const [updatingIndex, setUpdatingIndex] = useState<Record<string, boolean>>(
    {}
  );
  const [updatingVIndex, setUpdatingVIndex] = useState<Record<string, boolean>>(
    {}
  );
  const selectedList = useRef<string>();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>();
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [productBrandFilter, setProductBrandFilter] = useState<string>();
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>();
  const [titleFilter, setTitleFilter] = useState<string>();
  const [categoryFilter, setCategoryFilter] = useState<string>();
  const [indexFilter, setIndexFilter] = useState<number>();
  const [creatorFilter, setCreatorFilter] = useState<Creator | null>();
  const [dateSortFilter, setDateSortFilter] = useState<string>();
  const [offset, setOffset] = useState<number>(64);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: 64,
    marginBottom: '0.5rem',
    zIndex: 3,
  });
  const filterPanelHeight = useRef<number>();
  const windowHeight = window.innerHeight;
  const lastFocusedIndex = useRef<number>(-1);
  const bufferIndex = useRef<number>(-1);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<FeedItem>();
  const selectRef = useRef<any>(null);
  const loadMore = useRef<boolean>(false);
  const [style, setStyle] = useState<any>();
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) {
        setDetails(false);
        setIsCloning(false);
      }
    });
  });

  useEffect(() => {
    if (details || (isMobile && activeKey === '1'))
      setStyle({ overflow: 'scroll', height: '100%' });
    else setStyle({ overflow: 'clip', height: '100%' });
  }, [details, isMobile, activeKey]);

  useEffect(() => {
    getDetailsResources();
  }, []);

  const search = rows => {
    let updatedRows = rows;
    if (indexFilter) {
      updatedRows = updatedRows.filter(row => {
        return row.index && row.index === indexFilter;
      });
    }
    if (categoryFilter) {
      updatedRows = updatedRows.filter(
        row => row.category?.indexOf(categoryFilter) > -1
      );
    }
    return updatedRows;
  };

  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      return;
    }

    if (search(buffer).length < 30 && loadMore.current)
      getFeed(undefined, false);
    else setData(search(buffer));
    loadMore.current = false;
  }, [buffer]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  useEffect(() => {
    const panel = document.getElementById('filterPanel');

    if (isMobile && panel) {
      // Code for Chrome, Safari and Opera
      panel.addEventListener('webkitTransitionEnd', updateOffset);
      // Standard syntax
      panel.addEventListener('transitionend', updateOffset);

      return () => {
        // Code for Chrome, Safari and Opera
        panel.removeEventListener('webkitTransitionEnd', updateOffset);
        // Standard syntax
        panel.removeEventListener('transitionend', updateOffset);
      };
    }
  });

  const updateOffset = () => {
    if (activeKey === '1') {
      filterPanelHeight.current =
        document.getElementById('filterPanel')!.offsetHeight;
      if (filterPanelHeight.current! > windowHeight) {
        const heightDifference = filterPanelHeight.current! - windowHeight;
        const seventhWindowHeight = windowHeight / 7;
        setOffset(-heightDifference - seventhWindowHeight);
      }
    } else setOffset(64);
  };

  useEffect(() => {
    setPanelStyle({ top: offset, zIndex: 3 });
  }, [offset]);

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.focus({
        cursor: 'end',
      });
  }, [titleFilter,indexFilter]);

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

  const videoTypeMapping: SelectOption = {
    key: 'value',
    label: 'value',
    value: 'value',
  };

  const propagatevlink = async (value: string, record: any, index: number) => {
    try {
      setLoadingRow(value);
      lastFocusedIndex.current = index;
        const { result, success, message }: any = await propagateVLink(value);
      if (success) {
        buffer[index] = { ...record, shareLink: result, rebuilt: true };
        setData([...buffer]);
        msg.success(message);
      }
    } catch {} 
    finally {
      setLoadingRow("");
    } 
  };

  const getvLinkId = (record: any): string => {

    let vlinkId = record.package
      ?.find(pack => pack.shareLink)
      ?.shareLink
      ?.split("/")
      ?.slice(-1)
      ?.toString()

    return vlinkId
  }

  const addToList = async (value: string, feedItem: FeedItem) => {
    try {
      await addFeaturedFeed(feedItem.id, value);
      msg.success('Register updated with success.');
    } catch (err) {
      console.error(`Error while trying to update list.`, err);
    } finally {
      selectedList.current = value;
      setData([
        ...data.map(item => {
          if (item?.id === feedItem?.id)
            return { ...feedItem, listName: value };
          else return item;
        }),
      ]);
      selectRef.current?.blur();
    }
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const feedItemColumns: ColumnsType<FeedItem> = [
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyValueToClipboard value={id} />,
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Index">Index</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'index',
      width: '6%',
      render: (_, feedItem, index) => {
        if (updatingIndex[feedItem?.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <div style={{ minWidth: 10 }}>
              <InputNumber
                type="number"
                value={feedItem?.index}
                onFocus={event => event.stopPropagation()}
                onBlur={(event: any) =>
                  updateIndex(feedItem, event.target.value as unknown as any)
                }
                onPressEnter={(event: any) =>
                  updateIndex(feedItem, event.target.value as unknown as any)
                }
              />
            </div>
          );
        }
      },
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="vIndex">vIndex</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'vIndex',
      width: '6%',
      render: (_, feedItem) => {
        if (updatingVIndex[feedItem?.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              type="number"
              value={feedItem?.vIndex}
              onFocus={event => event.stopPropagation()}
              onBlur={(event: any) =>
                updateVIndex(feedItem, event.target.value as unknown as number)
              }
              onPressEnter={(event: any) =>
                updateVIndex(feedItem, event.target.value as unknown as number)
              }
            />
          );
        }
      },
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Title">Title</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'title',
      width: '15%',
      render: (value: string, feedItem: FeedItem, index: number) => (
        <Link
          onFocus={() => (bufferIndex.current = buffer.indexOf(feedItem))}
          onClick={() => handleEdit(index, feedItem)}
          to={{ pathname: window.location.pathname }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Segments">Segments</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'package',
      render: (pack: Array<any> = []) => <AntTag>{pack?.length ?? 0}</AntTag>,
      width: '8%',
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Length">Length</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'lengthTotal',
      width: '8%',
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Creation Date">Creation Date</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hCreationDate',
      width: '8%',
      render: (creation: Date) =>
        creation
          ? new Date(creation).toLocaleDateString('en-GB') +
            ' ' +
            new Date(creation).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Tags">Tags</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'package',
      width: '5%',
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Status">Status</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'status',
      width: '6%',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="InstaLink">InstaLink</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      render: (_: string, record: any) => (
        <div style={{wordWrap: 'break-word', wordBreak: 'break-word' }}>
          <Link
            onClick={() =>
              window
                .open(
                  record && record.rebuilt
                    ? record.shareLink ?? ''
                    : record.package?.find(pack => pack.shareLink)?.shareLink ??
                    '',
                  '_blank'
                )
                ?.focus()
            }
            to={{ pathname: window.location.pathname }}
          >
            {record
              ? record.rebuilt
                ? record.shareLink ?? ''
                : record.package?.find(pack => pack.shareLink)?.shareLink ?? ''
              : ''}
          </Link>

        </div>

      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Feed List">Feed List</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'listName',
      width: '5%',
      render: (_: string, feedItem: FeedItem) => {
        if (feedItem?.id !== selectedFeed?.id)
          return (
            <Button
              type="link"
              disabled={
                !feedItem.vLink?.productBrand && !feedItem.vLink?.creator
              }
              block
              style={{ zIndex: 10 }}
              onClick={() => setSelectedFeed(feedItem)}
            >
              <ProfileOutlined />
            </Button>
          );
        else
          return (
            <Select
              showSearch
              allowClear
              defaultOpen
              ref={selectRef}
              style={{ width: '100px' }}
              disabled={!feedList.length || loading}
              filterOption={filterOption}
              onChange={(value: string) => addToList(value, feedItem)}
              onBlur={() => setSelectedFeed(undefined)}
            >
              {feedList.map((curr: any) => (
                <Select.Option
                  key={curr.value}
                  value={curr.value}
                  label={curr.name}
                >
                  {curr.name}
                </Select.Option>
              ))}
            </Select>
          );
      },
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Rebuild">Rebuild</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      align: 'center',
      render: (_: string, record: any, index: number) => (
        <>
          <Button
            type="link"
            block
            onFocus={() => (bufferIndex.current = buffer.indexOf(record))}
            onClick={() =>
              propagatevlink(
                getvLinkId(record),
                record,
                index
              )
            }
            disabled={!record?.package?.find(pack => pack.shareLink) || loadingRow !== ""}
            loading={loadingRow === getvLinkId(record)}
          >
            {loadingRow !== getvLinkId(record) && <RedoOutlined />}
          </Button>
        </>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Clone">Clone</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      align: 'center',
      render: (_, feedItem: FeedItem, index: number) => (
        <>
          <Link
            onFocus={() => (bufferIndex.current = buffer.indexOf(feedItem))}
            onClick={() => handleEdit(index, feedItem, true)}
            to={{ pathname: window.location.pathname, state: feedItem }}
          >
            <CopyOutlined />
          </Link>
        </>
      ),
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, feedItem: FeedItem, index: number) => (
        <div style={{ minWidth: 50 }}>
          <Link
            onFocus={() => (bufferIndex.current = buffer.indexOf(feedItem))}
            onClick={() => handleEdit(index, feedItem)}
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
        </div>
      ),
    },
  ];

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    if (data.length) loaded.current = true;
  }, [data]);

  useEffect(() => {
    setisScrollable(details);

    if (!details) scrollToCenter(lastFocusedIndex.current);
  }, [details]);

  const getFeed = async (event?: Event, resetResults?: boolean) => {
    if (!loadMore.current && !resetResults && buffer.length < 30) {
      setEof(true);
      return;
    }
    if (resetResults) {
      setEof(false);
      collapse(resetResults);
    }
    const results = await fetchFeed(event, resetResults);
    if (resetResults) setBuffer(results as any);
    else setBuffer(prev => [...prev.concat(results)]);
  };

  const fetchFeed = async (event?: Event, resetResults?: boolean) => {
    if (event && activeKey !== '1') event.stopPropagation();
    const pageToUse = resetResults ? 0 : page;
    try {
      if (event) collapse(event);
      if (resetResults) scrollToCenter(0);
      setLoading(true);
      const { results }: any = await fetchVideoFeedV3({
        page: pageToUse,
        query: titleFilter,
        brandId: brandFilter?.id,
        status: statusFilter?.toUpperCase(),
        videoType: videoTypeFilter,
        productBrandId: productBrandFilter,
        dateSort: dateSortFilter,
        creatorId: creatorFilter?.id,
        category: categoryFilter,
        startIndex: indexFilter
      });
      setPage(pageToUse + 1);
      if (results.length < 30) setEof(true);
      return results;
    } catch (error) {
      msg.error('Error to get feed');
    }
  };

  const getDetailsResources = async () => {
    async function getCategories() {
      const response: any = await fetchCategories();
      setCategories(response.results);
    }
    async function getBrands() {
      const response: any = await fetchBrands();
      setBrands(response.results);
    }
    async function getProductBrands() {
      const response: any = await fetchProductBrands();
      setProductBrands(response.results);
    }
    await Promise.all([
      getCategories(),
      getBrands(),
      getProductBrands(),
    ]).then(() => setLoadingResources(false));
  };

  const deleteItem = async (_id: string, index: number) => {
    await deleteVideoFeed(_id);
    setBuffer(buffer.filter(item => item.id !== _id));
  };

  const refreshTable = (record: FeedItem, inserting?: boolean) => {
    if (inserting) {
      const newIndex = lastFocusedIndex.current + 1;
      buffer.splice(newIndex, 0, record);
      lastFocusedIndex.current = newIndex;
    } else buffer[lastFocusedIndex.current] = record;
    setBuffer([...buffer]);
    setDetails(false);
    setIsCloning(false);
    scrollToCenter(lastFocusedIndex.current);
  };

  const handleEdit = (
    index: number,
    videoFeed?: FeedItem,
    cloning?: boolean
  ) => {
    lastFocusedIndex.current = index;

    if (cloning) {
      
      if (videoFeed?.package) {
        const pkg = videoFeed?.package?.map((item: any) => {
          return { ...item, shareLink: undefined };
        });
        setSelectedVideoFeed({
          ...(videoFeed as any),
          id: undefined,
          shareLink: undefined,
          package: pkg,
          title: `Cloned - ${videoFeed?.title}`
        });
      }
      if (!videoFeed?.package) {
        setSelectedVideoFeed({
          ...(videoFeed as any),
          id: undefined,
          shareLink: undefined,   
          title: `Cloned - ${videoFeed?.title}`      
        });
      }
      setIsCloning(true)
    } else setSelectedVideoFeed(videoFeed);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const updateIndex = async (record: FeedItem, value?: number) => {
    if (record.index === value) return;
    record.index = value;

    setUpdatingIndex(prev => {
      const newValue = {
        ...prev,
      };
      newValue[record.id] = true;

      return newValue;
    });

    try {
      await saveVideoFeed(record);
      msg.success('Register updated with success.');
    } catch (err) {
      console.error(`Error while trying to update index.`, err);
    }

    setUpdatingIndex(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[record.id];
      return newValue;
    });
  };

  const updateVIndex = async (record: FeedItem, input?: number) => {
    if (record.vIndex === input) return;
    record.vIndex = input;

    setUpdatingVIndex(prev => {
      const newValue = {
        ...prev,
      };
      newValue[record.id] = true;

      return newValue;
    });

    try {
      await saveVideoFeed(record);
      msg.success('Register updated with success.');
    } catch (err) {
      console.error(`Error while trying to update index.`, err);
    }

    setUpdatingVIndex(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[record.id];
      return newValue;
    });
  };

  const handleSave = (record: FeedItem, newItem?: boolean) => {
    if (newItem) {
      setIndexFilter(undefined);
      setCreatorFilter(undefined);
      setCategoryFilter(undefined);
    }
    refreshTable(record, newItem);
    setSelectedVideoFeed(undefined);
  };

  const handleCancel = () => {
    setDetails(false);
    setIsCloning(false);
  };

  const Filters = () => {
    return (
      <>
        <Row gutter={[8, 8]} align="bottom">
          <Col lg={5} xs={24}>
            <Typography.Title level={5} title="Title">
              Title
            </Typography.Title>
            <Input
              allowClear
              disabled={loadingResources}
              ref={inputRef}
              onChange={event => setTitleFilter(event.target.value)}
              suffix={<SearchOutlined />}
              value={titleFilter}
              placeholder="Search by Title"
              onPressEnter={() => getFeed(undefined, true)}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Master Brand</Typography.Title>
            <SimpleSelect
              showSearch
              data={brands}
              onChange={(_, brand) => setBrandFilter(brand)}
              style={{ width: '100%' }}
              selectedOption={brandFilter?.id}
              optionMapping={masterBrandMapping}
              placeholder="Select a Master Brand"
              disabled={loadingResources}
              allowClear
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Product Brand</Typography.Title>
            <SimpleSelect
              showSearch
              data={productBrands}
              onChange={setProductBrandFilter}
              style={{ width: '100%' }}
              selectedOption={productBrandFilter}
              optionMapping={productBrandMapping}
              placeholder="Select a Product Brand"
              disabled={loadingResources}
              allowClear
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Status</Typography.Title>
            <Select
              placeholder="Select a Status"
              disabled={loadingResources}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              filterOption={filterOption}
              allowClear
              showSearch
              value={statusFilter}
            >
              {statusList.map((curr: any) => (
                <Select.Option
                  key={curr.value}
                  value={curr.value.toUpperCase()}
                  label={curr.value}
                >
                  {curr.value}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Category</Typography.Title>
            <SimpleSelect
              showSearch
              data={categories}
              onChange={(_, category) =>
                setCategoryFilter(category?.name ?? '')
              }
              style={{ width: '100%' }}
              selectedOption={categoryFilter}
              optionMapping={categoryMapping}
              placeholder="Select a Category"
              allowClear
              disabled={loadingResources}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Video Type</Typography.Title>
            <SimpleSelect
              showSearch
              data={videoTypeList}
              onChange={setVideoTypeFilter}
              style={{ width: '100%' }}
              selectedOption={videoTypeFilter}
              optionMapping={videoTypeMapping || loading}
              placeholder="Select a Video Type"
              allowClear
              disabled={loadingResources}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Start Index</Typography.Title>
            <InputNumber
              disabled={loadingResources}
              min={0}
              ref={inputRef}
              onChange={startIndex => setIndexFilter(startIndex ?? undefined)}
              placeholder="Select an Index"
              value={indexFilter}
              onPressEnter={() => getFeed(undefined, true)}
            />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Creator</Typography.Title>
            <CreatorsMultipleFetchDebounceSelect
                onChangeCreator={(_, creator) => setCreatorFilter(creator)}
                input={creatorFilter?.firstName}
                onClear={() => setCreatorFilter(null)}
                disabled={loadingResources}
              />
          </Col>
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>Date Sort</Typography.Title>
            <Select
              disabled={loadingResources}
              onChange={setDateSortFilter}
              placeholder="Select a Sorting Option"
              style={{ width: '100%' }}
              filterOption={filterOption}
              allowClear
              showSearch
              value={dateSortFilter}
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
          <Col lg={5} xs={24}>
            <Typography.Title level={5}>List Name</Typography.Title>
            <Select
              disabled={loadingResources}
              onChange={setList}
              placeholder="Select a List"
              style={{ width: '100%' }}
              filterOption={filterOption}
              allowClear
              showSearch
              value={list}
            >
              {feedList.map((curr: any) => (
                <Select.Option
                  key={curr.value}
                  value={curr.value}
                  label={curr.name}
                >
                  {curr.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
        </Row>
      </>
    );
  };

  const collapse = (event?: any) => {
    if (event && isMobile) {
      if (activeKey === '1') setActiveKey('0');
    }
  };

  const handleCollapseChange = () => {
    if (activeKey === '1') setActiveKey('0');
    else setActiveKey('1');
  };

  return (
    <div style={style}>
      {!details && (
        <>
          <PageHeader
            title="Video Feeds"
            subTitle={isMobile ? '' : 'List of Feeds'}
            extra={[
              <Button
                key="2"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => handleEdit(buffer.length - 1)}
              >
                New Item
              </Button>,
            ]}
            className={isMobile ? 'mb-1' : ''}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box mb-1"
            id="filterPanel"
            style={panelStyle}
          >
            <Col lg={20} xs={24}>
              {!isMobile && <Filters />}
              {isMobile && (
                <Collapse
                  ghost
                  activeKey={activeKey}
                  onChange={handleCollapseChange}
                  destroyInactivePanel
                >
                  <Panel
                    header={
                      activeKey === '1' ? (
                        <Typography.Title level={5}>
                          Click to Collapse
                        </Typography.Title>
                      ) : (
                        <Typography.Title level={5}>Filter</Typography.Title>
                      )
                    }
                    key="1"
                    extra={
                      isMobile && (
                        <Button
                          type="primary"
                          onClick={(event: any) => getFeed(event, true)}
                          loading={loading}
                          style={{ marginRight: '-2em' }}
                        >
                          Search
                          <SearchOutlined style={{ color: 'white' }} />
                        </Button>
                      )
                    }
                  >
                    <Filters />
                  </Panel>
                </Collapse>
              )}
            </Col>
            <Col lg={4}>
              <Row
                justify="space-between"
                align="bottom"
                className={isMobile ? 'mb-1 mt-1' : ''}
              >
                <Col flex="auto">
                  <Button
                    type="text"
                    onClick={collapse}
                    style={{
                      display: isMobile && activeKey === '1' ? 'block' : 'none',
                      background: 'none',
                    }}
                  >
                    <UpOutlined />
                  </Button>
                </Col>
                {!isMobile && (
                  <Button
                    type="primary"
                    onClick={() => getFeed(undefined, true)}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                )}
              </Row>
            </Col>
          </Row>
          <div className="custom-table">
            <InfiniteScroll
              height="27rem"
              dataLength={data.length}
              next={() => getFeed(undefined, false)}
              hasMore={!eof}
              loader={
                !eof &&
                page !== 0 && (
                  <div className="scroll-message">
                    <Spin spinning={loading} />
                  </div>
                )
              }
              endMessage={
                loaded.current && (
                  <div className="scroll-message">
                    <b>End of results.</b>
                  </div>
                )
              }
            >
              <Table
                scroll={{ x: true }}
                rowClassName={(_, index) => `scrollable-row-${index}`}
                size="small"
                columns={feedItemColumns}
                rowKey="id"
                dataSource={data}
                loading={loading}
                pagination={false}
              />
            </InfiniteScroll>
          </div>
        </>
      )}
      {details && (
        <VideoFeedDetail
          onSave={handleSave}
          onCancel={handleCancel}
          feedItem={selectedVideoFeed}
          brands={brands}
          productBrands={productBrands}
          isCloning={isCloning}
        />
      )}
    </div>
  );
};

export default withRouter(VideoFeed);
