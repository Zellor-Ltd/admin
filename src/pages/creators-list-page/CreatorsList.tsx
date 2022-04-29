import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Image,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from '../../components/SearchFilter';
import useFilter from '../../hooks/useFilter';
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
  const [filteredMastheads, setFilteredMastheads] = useState<Masthead[]>([]);

  const {
    setArrayList: setMastheads,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Masthead>([]);

  const getResources = useCallback(async () => {
    const { results } = await doFetch(fetchMastheads);
    setMastheads(results);
    setRefreshing(true);
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  const fetchData = () => {
    if (!filteredContent.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredMastheads(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredMastheads([]);
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
    }
  }, [details]);

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
        return a.description.localeCompare(b.description);
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

  const searchFilterFunction = (filterText: string) => {
    if (!filterText) {
      removeFilterFunction('description');
      setRefreshing(true);
      return;
    }
    addFilterFunction('description', Mastheads =>
      Mastheads.filter(Masthead =>
        Masthead.description.toUpperCase().includes(filterText.toUpperCase())
      )
    );
    setRefreshing(true);
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
    filteredMastheads[lastViewedIndex] = record;
    setMastheads([...filteredMastheads]);
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
              <Button
                key="1"
                onClick={() => editItem(filteredMastheads.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by Description"
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={filteredMastheads.length}
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
              dataSource={filteredMastheads}
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
