import { CalendarOutlined, EditOutlined } from "@ant-design/icons";
import { DatePicker, Col, PageHeader, Row, Select, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Transaction } from "interfaces/Transaction";
import { Fan } from "interfaces/Fan";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchFans, fetchWalletTransactions } from "services/DiscoClubService";
import moment from "moment";

const Transactions: React.FC<RouteComponentProps> = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  const [fans, setFans] = useState<Fan[]>([]);
  const [searchList, setSearchList] = useState<string[]>([]);
  const [selectedFan, setSelectedFan] = useState<string>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  const columns: ColumnsType<Transaction> = [
    {
      title: "Creation Time",
      dataIndex: "hCreationDate",
      width: "15%",
      align: "left",
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
      title: "Brand",
      dataIndex: "brandName",
      width: "15%",
      align: "center",
    },
    {
      title: "Disco Dollars",
      dataIndex: "discoDollars",
      width: "15%",
      align: "center",
    },
    {
      title: "Disco Gold",
      dataIndex: "discoGold",
      width: "15%",
      align: "center",
    },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record) => (
        <Link to={{ pathname: `/transactions`, state: record }}>
          <EditOutlined />
        </Link>
      ),
    },
  ];

  const onChangeFan = async (value: string) => {
    setSelectedFan(value);
    const { id: fanId } = fans.find(
      (fan) => fan.name === value || fan.email === value
    ) as Fan;
    setTableLoading(true);
    const { results }: any = await fetchWalletTransactions(fanId);
    setTableLoading(false);
    setTransactions(results);
    setFilteredTransactions(results);
  };

  useEffect(() => {
    const getFans = async () => {
      try {
        const { results }: any = await fetchFans();
        const _searchList: string[] = [];
        results.forEach((fan: Fan) => {
          if (fan.name) _searchList.unshift(fan.name);
          if (fan.email) _searchList.push(fan.email);
        });
        setSearchList(_searchList);
        setFans(results);
      } catch (e) {}
    };
    getFans();
  }, []);

  const handleDateChange = (values: any) => {
    if (!values) {
      setFilteredTransactions(transactions);
      return;
    }
    const startDate = moment(values[0], "DD/MM/YYYY").startOf("day").utc();
    const endDate = moment(values[1], "DD/MM/YYYY").endOf("day").utc();
    setFilteredTransactions(
      transactions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  return (
    <div className="transactions">
      <PageHeader title="Transactions" subTitle="List of Transactions" />
      <Row gutter={8} style={{ marginBottom: "20px" }}>
        <Col xxl={40} lg={6} xs={18}>
          <Select
            showSearch
            placeholder="Select a fan"
            style={{ width: "100%" }}
            onChange={onChangeFan}
            value={selectedFan}
          >
            {searchList.map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTransactions}
        loading={tableLoading}
      />
    </div>
  );
};

export default Transactions;
