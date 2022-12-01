import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Row,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Role } from 'interfaces/Role';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchProfiles } from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';

const Roles: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/role`;
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');
  const [buffer, setBuffer] = useState<Role[]>([]);
  const [data, setData] = useState<Role[]>([]);
  const { isMobile } = useContext(AppContext);

  async function fetch() {
    setLoading(true);
    try {
      const response: any = await fetchProfiles();
      setBuffer(response.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, buffer]);

  const columns: ColumnsType<Role> = [
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '15%',
      render: (value, record: Role) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
      ),
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
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
            <Tooltip title="Description">Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'description',
      width: '15%',
      sorter: (a, b): any => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return -1;
        else if (b.description) return 1;
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
      render: (value, record) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const search = rows => {
    return rows.filter(row => row.name?.toUpperCase().indexOf(filter) > -1);
  };

  return (
    <div style={{ overflow: 'clip', height: '100%' }}>
      <PageHeader
        title="Roles"
        subTitle={isMobile ? '' : 'List of Roles'}
        extra={[
          <Button
            key="1"
            className={isMobile ? 'mt-05' : ''}
            onClick={() => history.push(detailsPathname)}
          >
            New Item
          </Button>,
        ]}
      />
      <Row gutter={8} className="sticky-filter-box mb-05">
        <Col lg={4} xs={24}>
          <Typography.Title level={5}>Search</Typography.Title>
          <Input
            allowClear
            disabled={loading}
            placeholder="Search by Name"
            suffix={<SearchOutlined />}
            value={filter}
            onChange={event => {
              setFilter(event.target.value);
            }}
          />
        </Col>
      </Row>
      <div className="custom-table">
        <Table
          className="mt-15"
          scroll={{ x: true, y: 300 }}
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default Roles;
