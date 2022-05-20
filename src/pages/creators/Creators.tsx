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
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { Creator } from 'interfaces/Creator';
import React, { useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteCreator,
  fetchCreators,
  saveCreator,
} from 'services/DiscoClubService';
import CreatorDetail from './CreatorDetail';
import { useRequest } from 'hooks/useRequest';

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
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filter, setFilter] = useState<string>('');

  const fetch = async () => {
    const { results }: any = await doFetch(fetchCreators);
    setCreators(results);
    setLoaded(true);
  };

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
      sorter: (a, b): any => {
        if (a.firstName && b.firstName)
          return a.firstName.localeCompare(b.firstName);
        else if (a.firstName) return -1;
        else if (b.firstName) return 1;
        else return 0;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.status && b.status) return a.status.localeCompare(b.status);
        else if (a.status) return -1;
        else if (b.status) return 1;
        else return 0;
      },
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

  const search = rows => {
    return rows.filter(
      row => row?.firstName?.toLowerCase().indexOf(filter) > -1
    );
  };

  const refreshItem = (record: Creator) => {
    if (loaded) {
      creators[lastViewedIndex] = record;
      setCreators([...creators]);
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
              <Button key="1" onClick={() => editCreator(creators.length)}>
                New Item
              </Button>,
            ]}
          />
          <Row
            gutter={8}
            align="bottom"
            justify="space-between"
            className={'sticky-filter-box'}
          >
            <Col lg={8} xs={16}>
              <Typography.Title level={5}>
                Search by First Name
              </Typography.Title>
              <Input
                className="mb-1"
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
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
          <Table
            rowKey="id"
            columns={columns}
            dataSource={search(creators)}
            loading={loading}
          />
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
