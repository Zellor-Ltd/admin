import { CalendarOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  InputNumber,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Typography,
} from "antd";
import { useForm } from "antd/lib/form/Form";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import {
  WalletDetailParams,
  WalletTransaction,
} from "interfaces/WalletTransactions";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  addBalanceToUser,
  fetchTransactionsPerBrand,
  resetUserBalance,
} from "services/DiscoClubService";

const WalletDetail: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading: setLoading });
  const initial = location.state as unknown as WalletDetailParams;
  const [form] = useForm();

  const {
    // arrayList: wallets,
    setArrayList: setTransactions,
    filteredArrayList: filteredTransactions,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<WalletTransaction>([]);

  const getResources = async () => {
    const { results } = await doFetch(() =>
      fetchTransactionsPerBrand(initial.fan.id, initial.brand.id)
    );
    setTransactions(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<WalletTransaction> = [
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
    addFilterFunction("creationDate", (transactions: WalletTransaction[]) =>
      transactions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  const addBalance = async ({ balanceToAdd }: { balanceToAdd: number }) => {
    await doRequest(() =>
      addBalanceToUser(initial.fan.id, initial.brand.id, balanceToAdd)
    );
    form.resetFields();
    await getResources();
  };

  const resetBalance = async () => {
    await doRequest(() => resetUserBalance(initial.fan.id, initial.brand.id));
    await getResources();
  };

  return (
    <div className="walletdetail">
      <PageHeader title="Wallet Fan/Brand Transactions" />
      <Row align="bottom" justify="space-between">
        <Col lg={24} xs={24}>
          <Row gutter={8}>
            <Col lg={6} xs={12}>
              <Typography.Text strong>Fan: {initial.fan.user}</Typography.Text>
            </Col>
            <Col lg={6} xs={12}>
              <Typography.Text strong>
                Brand: {initial.brand.name}
              </Typography.Text>
            </Col>
            <Col lg={6} xs={12}>
              <Form form={form} onFinish={addBalance}>
                <Row gutter={2}>
                  <Col lg={16} xs={16}>
                    <Form.Item name="balanceToAdd">
                      <InputNumber></InputNumber>
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={8}>
                    <Button htmlType="submit" loading={loading} type="primary">
                      Add
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
            <Col lg={4} xs={8}>
              <Row justify="end">
                <Popconfirm
                  title="Are you sure？"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={resetBalance}
                >
                  <Button danger>Reset</Button>
                </Popconfirm>
              </Row>
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
