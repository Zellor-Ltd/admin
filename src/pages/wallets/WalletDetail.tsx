import { CalendarOutlined } from "@ant-design/icons";
import { Col, DatePicker, PageHeader, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { Order } from "interfaces/Order";
import { Wallet } from "interfaces/Wallet";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { fetchTransactionsPerBrand } from "services/DiscoClubService";

const WalletDetail: React.FC<RouteComponentProps> = ({ location }) => {
  const params = new URLSearchParams(location.search);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading: setLoading });

  const {
    // arrayList: wallets,
    setArrayList: setTransactions,
    filteredArrayList: filteredTransactions,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Wallet>([]);

  useEffect(() => {
    const getResources = async () => {
      const { results } = await doFetch(() =>
        fetchTransactionsPerBrand(
          params.get("fanId") as string,
          params.get("brandId") as string
        )
      );
      setTransactions(results);
    };
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<Wallet> = [
    {
      title: "Date Time",
      dataIndex: "hCreationDate",
      width: "20%",
      align: "left",
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={handleDateChange}
        />
      ),
      render: (value: Date) =>
        `${moment(value).format("DD/MM/YYYY")} ${moment(value).format(
          "HH:mm:ss"
        )}`,
    },
    {
      title: "Type",
      dataIndex: "type",
      width: "12%",
    },
    {
      title: "Amount",
      dataIndex: "discoDollars",
      width: "10%",
      align: "center",
    },
    {
      title: "Who",
      dataIndex: "userId",
      width: "20%",
      align: "right",
    },
  ];

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

  return (
    <div className="walletdetail">
      <PageHeader title="Wallet Fan/Brand Transactions" />
      <Row align="bottom" justify="space-between">
        <Col lg={16} xs={24}>
          <Row gutter={8}>
            <Col lg={8} xs={16}>
              Text1
            </Col>
            <Col lg={8} xs={16}>
              Text2
            </Col>
          </Row>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTransactions}
        loading={loading}
      />
    </div>
  );
};

export default WalletDetail;
