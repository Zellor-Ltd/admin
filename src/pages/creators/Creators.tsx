import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { Creator } from 'interfaces/Creator';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteCreator,
  fetchCreators,
  saveCreator,
} from 'services/DiscoClubService';

const tagColorByStatus: any = {
  approved: 'green',
  rejected: 'red',
  pending: '',
};

const Creators: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/creator`;
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<any[]>([]);

  const {
    setArrayList: setCreators,
    filteredArrayList: filteredCreators,
    addFilterFunction,
  } = useFilter<Creator>([]);

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
      render: value => `${value.firstName} ${value.lastName}`,
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
      render: (value, record) => (
        <>
          {!record.status && [
            <CheckOutlined
              key="approve"
              style={{ color: 'green' }}
              onClick={() => aproveOrReject(true, record)}
            />,
            <CloseOutlined
              key="reject"
              style={{ color: 'red', margin: '6px' }}
              onClick={() => aproveOrReject(false, record)}
            />,
          ]}
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const aproveOrReject = async (aprove: boolean, creator: Creator) => {
    setLoading(true);
    creator.status = aprove ? 'approved' : 'rejected';

    await saveCreator(creator);
    fetch();
  };

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      await deleteCreator(id);
      for (let i = 0; i < content.length; i++) {
        if (content[i].id === id) {
          const index = i;
          setCreators(prev => [
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ]);
        }
      }
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchCreators();
    setLoading(false);
    setCreators(response.results);
    setContent(response.results);
  };

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('creatorFirstName', creators =>
      creators.filter(creator =>
        (creator.firstName || '')
          .toUpperCase()
          .includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div className="creators">
      <PageHeader
        title="Creators"
        subTitle="List of Creators"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
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
          onClick={() => fetch()}
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
        dataSource={filteredCreators}
        loading={loading}
      />
    </div>
  );
};

export default Creators;
