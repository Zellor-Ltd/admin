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
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
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
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (refreshing) {
      setTags([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    setRefreshing(true);
  }, [searchFilter]);

  const fetchData = async () => {
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
    if (!loaded) {
      setRefreshing(true);
      setLoaded(true);
      return;
    }
    fetchData();
  };

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
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
    },
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      width: '20%',
    },
    { title: 'Master Brand', dataIndex: ['brand', 'brandName'], width: '20%' },
    { title: 'Template', dataIndex: 'template', width: '15%' },
    { title: "DD's", dataIndex: 'discoDollars', width: '5%' },
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
    if (loaded) {
      tags[lastViewedIndex] = record;
      setTags([...tags]);
    } else {
      setTags([record]);
    }
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
            subTitle="List of Tags"
            extra={[
              <Button key="1" onClick={() => editTag(tags.length)}>
                New Item
              </Button>,
            ]}
          />
          <Row align="bottom" justify="space-between">
            <Col lg={16} xs={24}>
              <Row gutter={[8, 8]}>
                <Col lg={8} xs={16}>
                  <SearchFilterDebounce
                    initialValue={searchFilter}
                    filterFunction={setSearchFilter}
                    label="Search by Name"
                  />
                </Col>
              </Row>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={fetch}
                loading={loading}
                style={{
                  marginBottom: '20px',
                  marginRight: '25px',
                }}
              >
                Search
                <SearchOutlined style={{ color: 'white' }} />
              </Button>
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
