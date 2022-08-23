/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Row, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { SearchFilterDebounce } from 'components/SearchFilterDebounce';
import { AppContext } from 'contexts/AppContext';
import { useRequest } from 'hooks/useRequest';
import { Tag } from 'interfaces/Tag';
import { useContext, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Link, RouteComponentProps } from 'react-router-dom';
import { deleteTag, fetchTags } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import TagDetail from './TagDetail';

const Tags: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(0);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTag, setCurrentTag] = useState<Tag>();
  const { usePageFilter } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const { isMobile } = useContext(AppContext);

  useEffect(() => {
    if (refreshing) {
      setTags([]);
      setEof(false);
      updateDisplayedArray();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    setRefreshing(true);
  }, [searchFilter]);

  const updateDisplayedArray = async () => {
    scrollToCenter(0);
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
  };

  const fetch = () => {
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
  }, [details]);

  const editTag = (index: number, tag?: Tag) => {
    setLastViewedIndex(index);
    setCurrentTag(tag);
    setDetails(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteTag({ id }));
    setTags(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const columns: ColumnsType<Tag> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Tag',
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
      title: 'Product',
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
      title: 'Master Brand',
      dataIndex: ['brand', 'brandName'],
      width: '20%',
      sorter: (a, b): any => {
        if (a.brand && b.brand)
          return a.brand.brandName?.localeCompare(b.brand.brandName);
        else if (a.brand) return -1;
        else if (b.brand) return 1;
        else return 0;
      },
    },
    {
      title: 'Template',
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
      title: "DD's",
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
      title: 'Actions',
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
        <>
          <PageHeader
            title="Tags"
            subTitle={isMobile ? '' : 'List of Tags'}
            className={isMobile ? 'mb-n1' : ''}
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
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box mb-1"
          >
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
                    onClick={fetch}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={tags.length}
            next={fetch}
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
              scroll={{ x: true }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={tags}
              loading={refreshing || (!tags.length && loading)}
              pagination={false}
            />
          </InfiniteScroll>
        </>
      )}
      {details && (
        <TagDetail tag={currentTag} onSave={onSaveTag} onCancel={onCancelTag} />
      )}
    </>
  );
};

export default Tags;
