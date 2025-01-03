/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Tooltip,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { SearchFilterDebounce } from 'components/SearchFilterDebounce';
import { AppContext } from 'contexts/AppContext';
import { useRequest } from 'hooks/useRequest';
import { Tag } from 'interfaces/Tag';
import { useContext, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import { deleteTag, fetchTags } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import TagDetail from './TagDetail';

const Tags: React.FC<RouteComponentProps> = ({ location }) => {
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(0);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTag, setCurrentTag] = useState<Tag>();
  const { usePageFilter } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const loaded = useRef<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const isMounted = useRef<boolean>(false);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    if (refreshing) {
      setEof(false);
      updateDisplayedArray();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (searchFilter) {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }
      setRefreshing(true);
    }
  }, [searchFilter]);

  const updateDisplayedArray = async () => {
    const pageToUse = refreshing ? 0 : page;

    const { results } = await doFetch(() =>
      fetchTags({
        limit: 30,
        page: pageToUse,
        query: searchFilter,
      })
    );

    setPage(pageToUse + 1);
    setTags(prev => [...prev.concat(results)]);

    if (results.length < 30) setEof(true);
    loaded.current = true;
  };

  const fetch = (scrollToTop?: boolean) => {
    if (scrollToTop) {
      scrollToCenter(0);
      setTags([]);
    }
    setRefreshing(true);
  };

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    if (!details) {
      scrollToCenter(lastViewedIndex);
    }

    setIsScrollable(details);
  }, [details]);

  const editTag = (index: number, tag?: Tag) => {
    setLastViewedIndex(index);
    setCurrentTag(tag);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteTag({ id }));
    setTags(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const columns: ColumnsType<Tag> = [
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
            <Tooltip title="ID">ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyValueToClipboard tooltipText="Copy ID" value={id} />,
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
            <Tooltip title="Tag">Tag</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'tagName',
      width: '15%',
      render: (value, record: Tag, index: number) => (
        <Link to={location.pathname} onClick={() => editTag(index, record)}>
          {value}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.tagName && b.tagName) return a.tagName.localeCompare(b.tagName);
        else if (a.tagName) return -1;
        else if (b.tagName) return 1;
        else return 0;
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
            <Tooltip title="Product">Product</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['product', 'name'],
      width: '20%',
      sorter: (a, b): any => {
        if (a.product && b.product)
          return a.product.name?.localeCompare(b.product.name);
        else if (a.product) return -1;
        else if (b.product) return 1;
        else return 0;
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
            <Tooltip title="Client">Client</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['brand', 'name'],
      width: '20%',
      sorter: (a, b): any => {
        if (a.brand && b.brand)
          return a.brand.name?.localeCompare(b.brand.name);
        else if (a.brand) return -1;
        else if (b.brand) return 1;
        else return 0;
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
            <Tooltip title="Template">Template</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'template',
      width: '15%',
      sorter: (a, b): any => {
        if (a.template && b.template)
          return a.template.localeCompare(b.template);
        else if (a.template) return -1;
        else if (b.template) return 1;
        else return 0;
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
            <Tooltip title="DDs">DDs</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'discoDollars',
      width: '5%',
      sorter: (a, b): any => {
        if (a.discoDollars && b.discoDollars)
          return a.discoDollars - b.discoDollars;
        else if (a.discoDollars) return -1;
        else if (b.discoDollars) return 1;
        else return 0;
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
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '5%',
      align: 'right',
      render: (value, record, index: number) => (
        <>
          <Link to={location.pathname} onClick={() => editTag(index, record)}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const refreshItem = (record: Tag) => {
    tags[lastViewedIndex] = record;
    setTags([...tags]);
  };

  const onSaveTag = (record: Tag) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelTag = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div style={{ overflow: 'clip', height: '100%' }}>
          <PageHeader
            title="Tags"
            subTitle={isMobile ? '' : 'List of Tags'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editTag(tags.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row align="bottom" justify="space-between" className="mb-05">
            <Col lg={4} xs={24}>
              <SearchFilterDebounce
                disabled={refreshing || loading}
                initialValue={searchFilter}
                filterFunction={setSearchFilter}
                label="Search"
                placeholder="Search by Name"
                onPressEnter={fetch}
              />
            </Col>
            <Col lg={4} xs={24}>
              <Row justify="end">
                <Col>
                  <Button
                    type="primary"
                    className={isMobile ? 'mt-1' : 'mt-1 mr-06'}
                    onClick={() => fetch(true)}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="custom-table">
            <InfiniteScroll
              height="30rem"
              dataLength={tags.length}
              next={fetch}
              hasMore={!eof}
              loader={
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
                rowKey="id"
                columns={columns}
                dataSource={tags}
                loading={refreshing || loading}
                pagination={false}
              />
            </InfiniteScroll>
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <TagDetail
            tag={currentTag}
            onSave={onSaveTag}
            onCancel={onCancelTag}
          />
        </div>
      )}
    </>
  );
};

export default Tags;
