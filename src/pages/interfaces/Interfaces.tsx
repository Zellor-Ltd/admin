import { Button, PageHeader, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Function } from 'interfaces/Function';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { fetchInterfaces } from 'services/DiscoClubService';
import { EditOutlined } from '@ant-design/icons';

const Interfaces: React.FC<RouteComponentProps> = ({ history }) => {
  const [interfaces, setInterfaces] = useState<Function[]>([]);
  const [loading, setLoading] = useState(false);
  const columns: ColumnsType<Function> = [
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
            <Tooltip title="HTTP Endpoint">HTTP Endpoint</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'httpEndpoint',
      width: '15%',
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
          <Link to={{ pathname: `/interface`, state: record }}>
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  async function fetch() {
    setLoading(true);
    try {
      const response: any = await fetchInterfaces();
      setInterfaces(response.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="interfaces">
      <PageHeader
        title="Interfaces"
        subTitle="List of Interfaces"
        extra={[
          <Button key="1" onClick={() => history.push('/interface')}>
            New Interface
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={interfaces}
        loading={loading}
      />
    </div>
  );
};

export default Interfaces;
