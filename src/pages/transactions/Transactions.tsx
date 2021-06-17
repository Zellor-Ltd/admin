import { EditOutlined } from "@ant-design/icons";
import { Col, PageHeader, Row, Select, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Transaction } from "interfaces/Transaction";
import { Fan } from "interfaces/Fan";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchFans } from "services/DiscoClubService";

const Transactions: React.FC<RouteComponentProps> = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [fansLoading, setFansLoading] = useState<boolean>(false);

  const [fans, setFans] = useState<Fan[]>([]);
  const [searchList, setSearchList] = useState<string[]>([]);
  const [selectedFan, setSelectedFan] = useState<string>("");

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const columns: ColumnsType<Transaction> = [
    {
      title: "Name",
      dataIndex: "name",
      width: "15%",
      align: "left",
    },
    {
      title: "Disco Dollars",
      dataIndex: "discoDollars",
      width: "15%",
      align: "center",
    },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record) => (
        <Link to={{ pathname: `/transaction`, state: record }}>
          <EditOutlined />
        </Link>
      ),
    },
  ];

  const onChangeFan = (value: string) => {
    setSelectedFan(value);
    const { id: fanId } = fans.find(
      (fan) => fan.name === value || fan.email === value
    ) as Fan;
    console.log(fanId);
  };

  useEffect(() => {
    const getFans = async () => {
      setFansLoading(true);
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
      setFansLoading(false);
    };
    getFans();
  }, []);

  return (
    <div className="transactions">
      <PageHeader title="Transactions" subTitle="List of Transactions" />
      <Row gutter={8}>
        <Col xxl={4} lg={6} xs={18}>
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
        dataSource={transactions}
        loading={tableLoading}
      />
    </div>
  );
};

export default Transactions;
