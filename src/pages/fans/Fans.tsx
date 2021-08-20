import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Input,
  PageHeader,
  Row,
  Table,
  Tag,
  Typography,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { Fan } from "interfaces/Fan";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchFans } from "services/DiscoClubService";

const tagColorByPermission: any = {
  Admin: "green",
  Temp: "blue",
  Fan: "",
};

const Fans: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [filterText, setFilterText] = useState("");

  async function fetch() {
    setLoading(true);
    try {
      const response: any = await fetchFans();
      setFans(response.results);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterFan = () => {
    return fans.filter((fan) => {
      fan.name = fan.name || "";
      const searchText = filterText.toUpperCase();
      return (
        fan.name.toUpperCase().includes(searchText) ||
        fan.user.toUpperCase().includes(searchText)
      );
    });
  };

  const columns: ColumnsType<Fan> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "15%",
      render: (value: string, record) => (
        <Link to={{ pathname: `/fan`, state: record }}>{value}</Link>
      ),
    },
    { title: "Name", dataIndex: "userName", width: "15%" },
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
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record) => (
        <>
          <Link to={{ pathname: `/fan`, state: record }}>
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
    <div className="fans">
      <PageHeader
        title="Fans"
        subTitle="List of Fans"
        extra={[
          <Button key="1" onClick={() => history.push("/fan")}>
            New Item
          </Button>,
        ]}
      />
      <div className="filter">
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={5} title="Search">
              Search
            </Typography.Title>
            <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
          </Col>
        </Row>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filterFan()}
        loading={loading}
      />
    </div>
  );
};
export default Fans;
