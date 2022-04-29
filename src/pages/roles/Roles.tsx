import { EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { Role } from 'interfaces/Role';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchProfiles } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { Creator } from '../../interfaces/Creator';

const Roles: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/role`;
  const [loading, setLoading] = useState<boolean>(false);

  const {
    setArrayList: setRoles,
    filteredArrayList: filteredRoles,
    addFilterFunction,
  } = useFilter<Role>([]);

  async function fetch() {
    setLoading(true);
    try {
      const response: any = await fetchProfiles();
      setRoles(response.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<Role> = [
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
      render: (value, record: Role) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
      ),
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '15%',
      sorter: (a, b) => {
        return (a.description ?? '').localeCompare(b.description ?? '');
      },
    },
    {
      title: 'Actions',
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('roleName', roles =>
      roles.filter(role =>
        role.name.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div className="roles">
      <PageHeader
        title="Roles"
        subTitle="List of Roles"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Item
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
        dataSource={filteredRoles}
        loading={loading}
      />
    </div>
  );
};

export default Roles;
