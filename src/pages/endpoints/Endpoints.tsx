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
import { Endpoint } from 'interfaces/Endpoint';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchEndpoints } from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';

const Endpoints: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/endpoint`;
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [buffer, setBuffer] = useState<Endpoint[]>([]);
  const [data, setData] = useState<Endpoint[]>([]);
  const { isMobile } = useContext(AppContext);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, buffer]);

  const columns: ColumnsType<Endpoint> = [
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
      render: (value, record: Endpoint) => (
        <>
          {!record.isActive && (
            <Link to={{ pathname: detailsPathname, state: record }}>
              {record.name}
            </Link>
          )}
          {record.isActive && `${record.name}`}
        </>
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
            <Tooltip title="Container">Container</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'container',
      width: '15%',
      sorter: (a, b): any => {
        if (a.container && b.container)
          return a.container.localeCompare(b.container);
        else if (a.container) return -1;
        else if (b.container) return 1;
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
            <Tooltip title="Method">Method</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'action',
      width: '10%',
      sorter: (a, b): any => {
        if (a.action && b.action) return a.action.localeCompare(b.action);
        else if (a.action) return -1;
        else if (b.action) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record: Endpoint) => (
        <>
          {!record.isActive && (
            <Link to={{ pathname: detailsPathname, state: record }}>
              <EditOutlined />
            </Link>
          )}
        </>
      ),
    },
  ];

  const fetch = async () => {
    setLoading(true);
    try {
      const response: any = await fetchEndpoints();
      setBuffer(response.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = rows => {
    return rows.filter(row => row.name?.toUpperCase().indexOf(filter) > -1);
  };

  return (
    <div className="endpoints" style={{ overflow: 'clip', height: '100%' }}>
      <PageHeader
        title="Endpoints"
        subTitle={isMobile ? '' : 'List of Endpoints'}
        extra={[
          <Button
            key="1"
            className={isMobile ? 'mt-05' : ''}
            onClick={() => history.push(detailsPathname)}
          >
            New Endpoint
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
      <div>
        <Table
          className="mt-1"
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

export default Endpoints;
