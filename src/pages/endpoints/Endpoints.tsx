import { EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { Endpoint } from 'interfaces/Endpoint';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchEndpoints } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';

const Endpoints: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/endpoint`;
  const [loading, setLoading] = useState(false);

  const {
    setArrayList: setEndpoints,
    filteredArrayList: filteredEndpoints,
    addFilterFunction,
  } = useFilter<Endpoint>([]);

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
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
    },
    {
      title: 'Container',
      dataIndex: 'container',
      width: '15%',
      sorter: (a, b) => {
        return a.container.localeCompare(b.container);
      },
    },
    {
      title: 'Method',
      dataIndex: 'action',
      width: '10%',
      sorter: (a, b) => {
        return a.action.localeCompare(b.action);
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('endpointName', endpoints =>
      endpoints.filter(endpoint =>
        endpoint.name.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div className="endpoints">
      <PageHeader
        title="Endpoints"
        subTitle="List of Endpoints"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Endpoint
          </Button>,
        ]}
      />
      <Row gutter={8} className={'sticky-filter-box'}>
        <Col lg={8} xs={16}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by Name"
          />
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredEndpoints}
        loading={loading}
      />
    </div>
  );
};

export default Endpoints;
