import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Image,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from '../../hooks/useRequest';
import { Masthead } from '../../interfaces/Masthead';
import { useCallback, useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteMasthead,
  fetchMastheads,
} from '../../services/DiscoClubService';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import CreatorsPageDetail from './CreatorsListDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const CreatorsPage: React.FC<RouteComponentProps> = ({ location }) => {
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setTableLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentMasthead, setCurrentMasthead] = useState<Masthead>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [mastheads, setMastheads] = useState<Masthead[]>([]);
  const [filter, setFilter] = useState<string>('');

  const getResources = useCallback(async () => {
    const { results } = await doFetch(fetchMastheads);
    setMastheads(results);
    setRefreshing(true);
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  const fetchData = () => {
    if (!mastheads.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = mastheads.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setMastheads(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setMastheads([]);
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

      if (search(mastheads).length < 10) setEof(true);
    }
  }, [details, mastheads]);

  const columns: ColumnsType<Masthead> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '15%',
      align: 'center',
      render: (value, record, index: number) => (
        <Link to={location.pathname} onClick={() => editItem(index, record)}>
          {value}
        </Link>
      ),
      sorter: (a, b) => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return 1;
        else if (b.description) return -1;
        else return 0;
      },
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: '15%',
      align: 'center',
      render: value => <Image className="active-masthead" src={value?.url} />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record, index: number) => (
        <>
          <Link to={location.pathname} onClick={() => editItem(index, record)}>
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

  const search = rows => {
    return rows.filter(
      row => row.description?.toLowerCase().indexOf(filter) > -1
    );
  };

  const editItem = (index: number, masthead?: Masthead) => {
    setLastViewedIndex(index);
    setCurrentMasthead(masthead);
    setDetails(true);
    setRefreshing(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteMasthead({ id }));
    setMastheads(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    setRefreshing(true);
  };
  const refreshItem = (record: Masthead) => {
    mastheads[lastViewedIndex] = record;
    setMastheads([...mastheads]);
  };

  const onSaveMasthead = (record: Masthead) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelMasthead = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div className="Mastheads">
          <PageHeader
            title="Mastheads"
            subTitle="List of Mastheads"
            extra={[
              <Button key="1" onClick={() => editItem(mastheads.length)}>
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={8} xs={16}>
              <Typography.Title level={5}>
                Search by Description
              </Typography.Title>
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
            dataLength={mastheads.length}
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
              dataSource={search(mastheads)}
              loading={tableloading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <CreatorsPageDetail
          masthead={currentMasthead}
          onSave={onSaveMasthead}
          onCancel={onCancelMasthead}
        />
      )}
    </>
  );
};

export default CreatorsPage;
