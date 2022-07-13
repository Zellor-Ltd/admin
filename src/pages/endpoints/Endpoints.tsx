import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Endpoint } from 'interfaces/Endpoint';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchEndpoints } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';

const Endpoints: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/endpoint`;
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);

  const handleResize = () => {
    if (window.innerWidth < 991) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  const columns: ColumnsType<Endpoint> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
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
      title: 'Container',
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
      title: 'Method',
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

  async function fetch() {
    setLoading(true);
    try {
      const response: any = await fetchEndpoints();
      setEndpoints(response.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = rows => {
    return rows.filter(row => row.name.toUpperCase().indexOf(filter) > -1);
  };

  return (
    <div className="endpoints">
      <PageHeader
        title="Endpoints"
        subTitle={isMobile ? '' : 'List of Endpoints'}
        className={isMobile ? 'mb-n1' : ''}
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
      <Row gutter={8} className={'sticky-filter-box'}>
        <Col lg={4} xs={24}>
          <Typography.Title level={5}>Search</Typography.Title>
          <Input
            placeholder="Search by Name"
            suffix={<SearchOutlined />}
            className="mb-1"
            value={filter}
            onChange={event => {
              setFilter(event.target.value);
            }}
          />
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={search(endpoints)}
        loading={loading}
      />
    </div>
  );
};

export default Endpoints;
