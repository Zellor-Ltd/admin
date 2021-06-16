import { Button, PageHeader, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Order } from "interfaces/Order";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchOrders } from "services/DiscoClubService";
import { EditOutlined } from "@ant-design/icons";
import moment from "moment";

const Orders: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const columns: ColumnsType<Order> = [
    {
      title: "Paid",
      dataIndex: "paid",
      width: "5%",
      align: "center",
      render: (value: boolean) => <b>{value ? "Yes" : "No"}</b>,
    },
    {
      title: "Amount / 100",
      dataIndex: "amount",
      width: "5%",
      align: "center",
      render: (value: number) => `${value / 100}x`,
    },
    {
      title: "Name",
      dataIndex: ["product", "name"],
      width: "12%",
      align: "center",
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "10%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:MM:SS")}</div>
        </>
      ),
    },
    {
      title: "Disco Dollars",
      dataIndex: "discoDollars",
      width: "5%",
      align: "center",
    },
    {
      title: "Stage",
      dataIndex: "stage",
      width: "15%",
      align: "center",
    },
    {
      title: "Last Update",
      dataIndex: "hLastUpdate",
      width: "10%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:MM:SS")}</div>
          {/* <div style={{ color: "grey" }}>({moment(value).fromNow()})</div> */}
        </>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <Link to={{ pathname: `/order`, state: record }}>
          <EditOutlined />
        </Link>
      ),
    },
  ];

  const getOrders = async () => {
    const response: any = await fetchOrders();
    setOrders(response.results.filter((order: Order) => !!order.product));
  };

  useEffect(() => {
    const getResources = async () => {
      setLoading(true);
      await getOrders();
      setLoading(false);
    };
    getResources();
  }, []);

  return (
    <div className="orders">
      <PageHeader
        title="Orders"
        subTitle="List of Orders"
        extra={[
          <Button key="1" onClick={() => history.push("/order")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={orders}
        loading={loading}
      />
    </div>
  );
};

export default Orders;
