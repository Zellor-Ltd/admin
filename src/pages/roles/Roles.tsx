import { Button, PageHeader, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Role } from "interfaces/Role";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchProfiles } from "services/DiscoClubService";
import { EditOutlined } from "@ant-design/icons";

const Roles: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
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
  }, []);

  const columns: ColumnsType<Role> = [
    { title: "Name", dataIndex: "name", width: "15%" },
    { title: "Description", dataIndex: "description", width: "15%" },
    {
      title: "actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <>
          <Link to={{ pathname: `/role`, state: record }}>
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="roles">
      <PageHeader
        title="Roles"
        subTitle="List of Roles"
        extra={[
          <Button key="1" onClick={() => history.push("/role")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={roles}
        loading={loading}
      />
    </div>
  );
};

export default Roles;
