import { EditOutlined } from '@ant-design/icons';
import { Button, Col, Input, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Role } from 'interfaces/Role';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchProfiles } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';

const Roles: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/role`;
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('');
  const [roles, setRoles] = useState<Role[]>([]);

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
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Description',
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

  const search = rows => {
    return rows.filter(row => row.name.toUpperCase().indexOf(filter) > -1);
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
          <Typography.Title level={5}>Search by Name</Typography.Title>
          <Input
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
        dataSource={search(roles)}
        loading={loading}
      />
    </div>
  );
};

export default Roles;
