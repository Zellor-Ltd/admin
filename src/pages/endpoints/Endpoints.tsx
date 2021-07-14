import { Button, PageHeader, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Endpoint } from "interfaces/Endpoint";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchEndpoints } from "services/DiscoClubService";
import { EditOutlined } from "@ant-design/icons";

const Endpoints: React.FC<RouteComponentProps> = ({ history }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const columns: ColumnsType<Endpoint> = [
    { title: "Name", dataIndex: "name", width: "15%" },
    { title: "Container", dataIndex: "container", width: "15%" },
    { title: "Method", dataIndex: "action", width: "10%" },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record: Endpoint) => (
        <>
          {!record.isActive && (
            <Link to={{ pathname: `/endpoint`, state: record }}>
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
  }, []);

  return (
    <div className="endpoints">
      <PageHeader
        title="Endpoints"
        subTitle="List of Endpoints"
        extra={[
          <Button key="1" onClick={() => history.push("/endpoint")}>
            New Endpoint
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={endpoints}
        loading={loading}
      />
    </div>
  );
};

export default Endpoints;
