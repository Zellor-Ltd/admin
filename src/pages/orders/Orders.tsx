import { EditOutlined } from "@ant-design/icons";
import { Button, PageHeader, Select, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Order } from "interfaces/Order";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchOrders, saveOrder } from "services/DiscoClubService";
import { useSelector } from "react-redux";

const Orders: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const [orderUpdateList, setOrderUpdateList] = useState<boolean[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const {
    settings: { order: ordersSettings = [] },
  } = useSelector((state: any) => state.settings);

  const handleSelectChange = async (value: string, orderIndex: number) => {
    const currentOrderUpdateList = [...orderUpdateList];
    currentOrderUpdateList[orderIndex] = true;
    setOrderUpdateList(currentOrderUpdateList);
    await saveOrder({
      ...orders[orderIndex],
      stage: value,
    });
    setOrderUpdateList((prev) => {
      prev[orderIndex] = false;
      return [...prev];
    });
  };

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
      render: (value: string, _, index) => (
        <Select
          loading={orderUpdateList[index]}
          disabled={orderUpdateList[index]}
          defaultValue={value}
          style={{ width: "175px" }}
          onChange={(value) => handleSelectChange(value, index)}
        >
          {ordersSettings.map((ordersSetting: any) => (
            <Select.Option
              key={ordersSetting.value}
              value={ordersSetting.value}
            >
              {ordersSetting.name}
            </Select.Option>
          ))}
        </Select>
      ),
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
      render: (_, record) => (
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
      setTableLoading(true);
      await getOrders();
      setTableLoading(false);
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
        loading={tableloading}
      />
    </div>
  );
};

export default Orders;
