import { Button, Col, PageHeader, Popconfirm, Row, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Creator } from "interfaces/Creator";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deleteCreator,
  fetchCreators,
  saveCreator,
} from "services/DiscoClubService";
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import useFilter from "hooks/useFilter";
import { SearchFilter } from "components/SearchFilter";
import CopyIdToClipboard from "components/CopyIdToClipboard";

const tagColorByStatus: any = {
  approved: "green",
  rejected: "red",
  pending: "",
};

const Creators: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const {
    setArrayList: setCreators,
    filteredArrayList: filteredCreators,
    addFilterFunction,
  } = useFilter<Creator>([]);

  const columns: ColumnsType<Creator> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "3%",
      render: (id) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
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
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <>
          {!record.status && [
            <CheckOutlined
              key="approve"
              style={{ color: "green" }}
              onClick={() => aproveOrReject(true, record)}
            />,
            <CloseOutlined
              key="reject"
              style={{ color: "red", margin: "6px" }}
              onClick={() => aproveOrReject(false, record)}
            />,
          ]}
          <Link to={{ pathname: `/creator`, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const aproveOrReject = async (aprove: boolean, creator: Creator) => {
    setLoading(true);
    creator.status = aprove ? "approved" : "rejected";

    await saveCreator(creator);
    fetch();
  };

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      await deleteCreator(id);
      await fetch();
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchCreators();
    setLoading(false);
    setCreators(response.results);
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("creatorFirstName", (creators) =>
      creators.filter((creator) =>
        (creator.firstName || "")
          .toUpperCase()
          .includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div className="creators">
      <PageHeader
        title="Creators"
        subTitle="List of Creators"
        extra={[
          <Button key="1" onClick={() => history.push("/creator")}>
            New Item
          </Button>,
        ]}
      />
      <Row gutter={8}>
        <Col lg={8} xs={16}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by First Name"
          />
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredCreators}
        loading={loading}
      />
    </div>
  );
};

export default Creators;
