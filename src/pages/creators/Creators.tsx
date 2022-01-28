import {
  CheckOutlined,
  CloseOutlined,
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
  Tag,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { Creator } from 'interfaces/Creator';
import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteCreator,
  fetchCreators,
  saveCreator,
} from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import CreatorDetail from './CreatorDetail';
import { useRequest } from 'hooks/useRequest';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Image } from '../../interfaces/Image';

const tagColorByStatus: any = {
  approved: 'green',
  rejected: 'red',
  pending: '',
};

const Creators: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentCreator, setCurrentCreator] = useState<Creator>();
  const { doFetch } = useRequest({ setLoading });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const timeoutRef = useRef<any>();

  const {
    setArrayList: setCreators,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Creator>([]);

  const fetch = async () => {
    const { results }: any = await doFetch(fetchCreators);
    setCreators(results);
    setLoaded(true);
  };

  useEffect(() => {
    setFilteredCreators([]);
    paginateData();
  }, [filteredContent]);

  const paginateData = () => {
    if (!filteredContent.length) {
      return;
    }

    const results = filteredContent.slice(page * 10, page * 10 + 10);

    setFilteredCreators(prev => [...prev.concat(results)]);

    if (results.length < 10) {
      setEof(true);
    } else {
      setPage(page + 1);
    }
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

  const editCreator = (index: number, creator?: Creator) => {
    setLastViewedIndex(index);
    setCurrentCreator(creator);
    setDetails(true);
  };

  const columns: ColumnsType<Creator> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '3%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      width: '15%',
      render: (_, record: Creator, index: number) => (
        <Link to={location.pathname} onClick={() => editCreator(index, record)}>
          {`${record.firstName} ${record.lastName}`}
        </Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '15%',
      render: (value = 'pending') => (
        <Tag color={tagColorByStatus[value]}>{value}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (value, record, index) => (
        <>
          {!record.status && [
            <CheckOutlined
              key="approve"
              style={{ color: 'green' }}
              onClick={() => approveOrReject(true, record)}
            />,
            <CloseOutlined
              key="reject"
              style={{ color: 'red', margin: '6px' }}
              onClick={() => approveOrReject(false, record)}
            />,
          ]}
          <Link
            to={location.pathname}
            onClick={() => editCreator(index, record)}
          >
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

  const approveOrReject = async (aprove: boolean, creator: Creator) => {
    setLoading(true);
    creator.status = aprove ? 'approved' : 'rejected';

    await saveCreator(creator);
    fetch();
  };

  const deleteItem = async (id: string, index: number) => {
    try {
      setLoading(true);
      await deleteCreator(id);
      setCreators(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const searchFilterFunction = (filterText: string) => {
    setPage(0);
    setEof(false);
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
    }

    if (!filterText) {
      removeFilterFunction('fullName');
    } else {
      timeoutRef.current = setTimeout(() => {
        addFilterFunction('fullName', creators =>
          creators.filter(creator =>
            `${creator.firstName || ''} ${creator.lastName || ''}`
              .toUpperCase()
              .includes(filterText.toUpperCase())
          )
        );
      }, 250);
    }
  };

  const refreshItem = (record: Creator) => {
    if (loaded) {
      filteredCreators[lastViewedIndex] = record;
      setCreators([...filteredCreators]);
    } else {
      setCreators([record]);
    }
  };

  const onSaveCreator = (record: Creator) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelCreator = () => {
    setDetails(false);
  };

  const onRollback = (
    oldUrl: string,
    _sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    imageIndex: number
  ) => {
    if (currentCreator) {
      currentCreator[_sourceProp][imageIndex].url = oldUrl;
      setCurrentCreator({ ...currentCreator });
    }
  };

  return (
    <>
      {!details && (
        <div className="creators">
          <PageHeader
            title="Creators"
            subTitle="List of Creators"
            extra={[
              <Button
                key="1"
                onClick={() => editCreator(filteredCreators.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} align="bottom" justify="space-between">
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by First Name"
              />
            </Col>
            <Button
              type="primary"
              onClick={fetch}
              loading={loading}
              style={{
                marginBottom: '16px',
                marginRight: '25px',
              }}
            >
              Search
              <SearchOutlined style={{ color: 'white' }} />
            </Button>
          </Row>
          <InfiniteScroll
            dataLength={filteredCreators.length}
            next={paginateData}
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
              dataSource={filteredCreators}
              loading={loading}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <CreatorDetail
          creator={currentCreator}
          onSave={onSaveCreator}
          onCancel={onCancelCreator}
          onRollback={onRollback}
        />
      )}
    </>
  );
};

export default Creators;
