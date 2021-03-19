import { Button, PageHeader, Popconfirm, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Creator } from "interfaces/Creator";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchCreators, saveCreator } from "services/DiscoClubService";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const tagColorByStatus: any = {
  approved: "green",
  rejected: "red",
  pending: "",
};

const Creators: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [creators, setCreators] = useState<Creator[]>([]);

  const columns: ColumnsType<Creator> = [
    { title: "Name", dataIndex: "firstName", width: "15%" },
    { title: "Last Name", dataIndex: "lastName", width: "15%" },
    {
      title: "Status",
      dataIndex: "status",
      width: "15%",
      render: (value = "pending") => (
        <Tag color={tagColorByStatus[value]}>{value}</Tag>
      ),
    },
    {
      title: "actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <>
          {!record.status && [
            <CheckOutlined
              style={{ color: "green" }}
              onClick={() => aproveOrReject(true, record)}
            />,
            <CloseOutlined
              style={{ color: "red", margin: "6px" }}
              onClick={() => aproveOrReject(false, record)}
            />,
          ]}
          <Link to={{ pathname: `/creator`, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined onClick={() => deleteCreator(record.id)} />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const deleteCreator = async (id: any) => {
    setLoading(true);
    await deleteCreator(id);
    setLoading(false);
  };

  const aproveOrReject = async (aprove: boolean, creator: Creator) => {
    creator.status = aprove ? "approved" : "rejected";

    await saveCreator(creator);
  };

  useEffect(() => {
    let mounted = true;
    const fetchVideos = async () => {
      setLoading(true);
      const response: any = await fetchCreators();
      if (mounted) {
        setLoading(false);
        setCreators(response.results);
      }
    };

    fetchVideos();
  }, []);
  return (
    <div className="creators">
      <PageHeader
        title="Creators"
        subTitle="List of Creators"
        extra={[
          <Button key="1" onClick={() => history.push("/creator/0")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={creators}
        loading={loading}
      />
    </div>
  );
};

export default Creators;
