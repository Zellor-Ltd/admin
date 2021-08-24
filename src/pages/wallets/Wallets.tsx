import { Col, PageHeader, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SelectFan } from "components/SelectFan";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { Fan } from "interfaces/Fan";
import { Wallet } from "interfaces/Wallet";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchWallets } from "services/DiscoClubService";

const Wallets: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading: setLoading });

  const {
    // arrayList: wallets,
    setArrayList: setWallets,
    filteredArrayList: filteredWallets,
  } = useFilter<Wallet>([]);

  const columns: ColumnsType<Wallet> = [
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "40%",
      render: (value: string, record: Wallet) => (
        <Link to={{ pathname: `wallet`, state: record }}>{value}</Link>
      ),
    },
    {
      title: "DD Balance",
      dataIndex: "ddBalance",
      width: "15%",
      align: "right",
    },
  ];

  const onChangeFan = async (_selectedFan: Fan) => {
    const { results }: any = await doFetch(() => fetchWallets(_selectedFan.id));
    setWallets(results);
  };

  return (
    <div className="wallets">
      <PageHeader title="Fan Wallets" subTitle="List of fan wallets" />
      <Row gutter={8} style={{ marginBottom: "20px" }}>
        <Col xxl={40} lg={6} xs={18}>
          <SelectFan
            style={{ width: "100%" }}
            onChange={onChangeFan}
          ></SelectFan>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredWallets}
        loading={loading}
      />
    </div>
  );
};

export default Wallets;
