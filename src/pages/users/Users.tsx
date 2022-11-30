import { EditOutlined } from '@ant-design/icons';
import { Button, PageHeader, Table, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { User } from 'interfaces/User';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchUsers } from 'services/DiscoClubService';

const tagColorByPermission: any = {
  Admin: 'green',
  Temp: 'blue',
  Fan: '',
};

const Users: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);

  async function fetch() {
    setLoading(true);
    try {
      const response: any = await fetchUsers();
      setUsers(response.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const columns: ColumnsType<User> = [
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
      sorter: (a, b) => {
        return a.name.localeCompare(b.name);
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
            <Tooltip title="E-mail">E-mail</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'user',
      width: '15%',
      sorter: (a, b) => {
        return a.user.localeCompare(b.user);
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
            <Tooltip title="Profile">Profile</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'profile',
      width: '5%',
      render: (profile = 'Fan') => (
        <Tag color={tagColorByPermission[profile]}>{profile}</Tag>
      ),
      align: 'center',
      sorter: (a, b) => {
        return a.profile.localeCompare(b.profile);
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
          <Link to={{ pathname: '/user', state: record }}>
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="users">
      <PageHeader
        title="Users"
        subTitle="List of Users"
        extra={[
          <Button key="1" onClick={() => history.push('/user')}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
      />
    </div>
  );
};
export default Users;
