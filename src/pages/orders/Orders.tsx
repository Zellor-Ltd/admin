import { CalendarOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Input,
  message,
  PageHeader,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { SelectBrand } from "components/SelectBrand";
import { Brand } from "interfaces/Brand";
import { Fan } from "interfaces/Fan";
import { Order } from "interfaces/Order";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchFans, fetchOrders, saveOrder } from "services/DiscoClubService";
import useFilter from "hooks/useFilter";

const Orders: React.FC<RouteComponentProps> = () => {
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const [orderUpdateList, setOrderUpdateList] = useState<boolean[]>([]);

  const {
    arrayList: orders,
    setArrayList: setOrders,
    filteredArrayList: filteredOrders,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Order>([]);

  const [fans, setFans] = useState<Fan[]>([]);

  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");

  const searchInput = useRef<Input>(null);

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };

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

    const _orders = [...orders];
    _orders[orderIndex].hLastUpdate = moment
      .utc()
      .format("YYYY-MM-DDTHH:mm:ss.SSSSSSSZ");
    setOrders(_orders);

    message.success("Changes saved!");
    setOrderUpdateList((prev) => {
      prev[orderIndex] = false;
      return [...prev];
    });
  };

  const handleDateChange = (values: any) => {
    if (!values) {
      removeFilterFunction("creationDate");
      return;
    }
    const startDate = moment(values[0], "DD/MM/YYYY").startOf("day").utc();
    const endDate = moment(values[1], "DD/MM/YYYY").endOf("day").utc();
    addFilterFunction("creationDate", (orders: Order[]) =>
      orders.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  const getFan = (fanId: string) => fans.find((fan) => fan.id === fanId);

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: any;
      selectedKeys: any;
      confirm: any;
      clearFilters: any;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) => {
      const fan = getFan(record.userid);
      return fan?.user.includes(value.toLowerCase()) || false;
    },
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.current!.select(), 100);
      }
    },
    render: (userId: any) => {
      const fan = getFan(userId);
      return (
        <Link to={{ pathname: `/fan`, state: fan }}>
          <Highlighter
            highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={fan?.user || ""}
          />
        </Link>
      );
    },
  });

  const columns: ColumnsType<Order> = [
    {
      title: "User",
      dataIndex: "userid",
      width: "10%",
      align: "left",
      ...getColumnSearchProps("userid"),
    },
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
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={handleDateChange}
        />
      ),
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:mm")}</div>
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
          <div>{moment(value).format("HH:mm")}</div>
          {/* <div style={{ color: "grey" }}>({moment(value).fromNow()})</div> */}
        </>
      ),
    },
    // {
    //   title: "Actions",
    //   key: "action",
    //   width: "5%",
    //   align: "right",
    //   render: (_, record) => (
    //     <Link to={{ pathname: `/order`, state: record }}>
    //       <EditOutlined />
    //     </Link>
    //   ),
    // },
  ];

  const getOrders = async () => {
    const response: any = await fetchOrders();
    const orders = response.results.filter((order: Order) => !!order.product);
    return orders;
  };

  const getFans = async () => {
    const response: any = await fetchFans();
    return response.results;
  };

  useEffect(() => {
    const getResources = async () => {
      setTableLoading(true);
      const orders: Order[] = await getOrders();
      const fans: Fan[] = await getFans();
      const ordersWithFanName = orders.map((order) => {
        const fan = fans.find((fan) => fan.id === order.userId);
        order.fanName = fan?.name;
        return order;
      });
      setOrders(ordersWithFanName);
      setFans(fans);
      setTableLoading(false);
    };
    getResources();
  }, [setOrders]);

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction("brandName");
      return;
    }
    addFilterFunction("brandName", (orders) =>
      orders.filter(
        (order) => order.product?.brand.brandName === _selectedBrand.brandName
      )
    );
  };

  return (
    <div className="orders">
      <PageHeader title="Orders" subTitle="List of Orders" />
      <Row gutter={8}>
        <Col xxl={40} lg={6} xs={18}>
          <SelectBrand
            style={{ width: "100%" }}
            allowClear={true}
            onChange={onChangeBrand}
          ></SelectBrand>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredOrders}
        loading={tableloading}
      />
    </div>
  );
};

export default Orders;
