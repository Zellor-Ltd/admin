import { Button, PageHeader, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { User } from "interfaces/User";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchUsers } from "services/DiscoClubService";
import { EditOutlined } from "@ant-design/icons";

const tagColorByPermission: any = {
  Admin: "green",
  Temp: "blue",
  Fan: "",
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
    { title: "Name", dataIndex: "name", width: "15%" },
    { title: "E-mail", dataIndex: "user", width: "15%" },
    {
      title: "Profile",
      dataIndex: "profile",
      width: "5%",
      render: (profile = "Fan") => (
        <Tag color={tagColorByPermission[profile]}>{profile}</Tag>
      ),
      align: "center",
    },
    {
      title: "actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <>
          <Link to={{ pathname: `/user`, state: record }}>
            <EditOutlined />
          </Link>
          {/* <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}>
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm> */}
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
          <Button key="1" onClick={() => history.push("/user")}>
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
