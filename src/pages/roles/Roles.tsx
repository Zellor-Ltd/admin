import { EditOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import useFilter from "hooks/useFilter";
import { Role } from "interfaces/Role";
import { useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { fetchProfiles } from "services/DiscoClubService";

const Roles: React.FC<RouteComponentProps> = ({ history }) => {
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
    { title: "Name", dataIndex: "name", width: "15%" },
    { title: "Description", dataIndex: "description", width: "15%" },
    {
      title: "Actions",
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("roleName", (roles) =>
      roles.filter((role) =>
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
          <Button key="1" onClick={() => history.push("/role")}>
            New Item
          </Button>,
        ]}
      />
      <Row gutter={8}>
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
