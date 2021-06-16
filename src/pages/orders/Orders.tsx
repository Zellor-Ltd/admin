import { Button, PageHeader, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Order } from "interfaces/Order";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchOrders } from "services/DiscoClubService";
import { EditOutlined } from "@ant-design/icons";

const Orders: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const columns: ColumnsType<Order> = [
    { title: "Name", dataIndex: "firstName", width: "15%" },
    { title: "Last Name", dataIndex: "lastName", width: "15%" },
    {
      title: "actions",
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
