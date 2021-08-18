import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { FanGroup } from "interfaces/FanGroup";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { deleteFanGroup, fetchFanGroups } from "services/DiscoClubService";

const FanGroups: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });

  const {
    setArrayList: setFanGroups,
    filteredArrayList: filteredFanGroups,
    addFilterFunction,
  } = useFilter<FanGroup>([]);

  const getResources = async () => {
    await getFanGroups();
  };

  const getFanGroups = async () => {
    const { results } = await doFetch(fetchFanGroups);
    setFanGroups(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteFanGroup({ id }));
    await getFanGroups();
  };

  const columns: ColumnsType<FanGroup> = [
    {
      title: "Group Name",
      dataIndex: "name",
      width: "20%",
      render: (value: string, record: FanGroup) => (
        <Link to={{ pathname: "fans-group", state: record }}>{value}</Link>
      ),
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "15%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:mm")}</div>
        </>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record: FanGroup) => (
        <>
          <Link to={{ pathname: "fans-group", state: record }}>
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("fanGroupName", (fanGroups) =>
      fanGroups.filter((fanGroup) =>
        fanGroup.name.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Fan Groups"
        subTitle="List of Fan Groups"
        extra={[
          <Button key="1" onClick={() => history.push("fans-group")}>
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
        dataSource={filteredFanGroups}
        loading={loading}
      />
    </div>
  );
};

export default FanGroups;
