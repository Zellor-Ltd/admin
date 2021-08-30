import { Col, PageHeader, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SelectFan } from "components/SelectFan";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { Fan } from "interfaces/Fan";
import { Wallet } from "interfaces/Wallet";
import { WalletDetailParams } from "interfaces/WalletTransactions";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchBalancePerBrand } from "services/DiscoClubService";

const Wallets: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFan, setSelectedFan] = useState<Fan>();
  const { doFetch } = useRequest({ setLoading: setLoading });

  const {
    // arrayList: wallets,
    setArrayList: setWallets,
    filteredArrayList: filteredWallets,
  } = useFilter<Wallet>([]);

  const columns: ColumnsType<Wallet> = [
    {
      title: "Brand",
      dataIndex: "brandName",
      width: "40%",
      render: (value: string, record: Wallet) => (
        <Link
          to={{
            pathname: "wallet",
            state: {
              fan: selectedFan,
              brand: {
                id: record.brandId,
                discoDollars: record.discoDollars,
                discoGold: record.discoGold,
                name: record.brandName,
              },
            } as WalletDetailParams,
          }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: "DD Balance",
      dataIndex: "discoDollars",
      width: "15%",
      align: "right",
    },
  ];

  const onChangeFan = async (_selectedFan: Fan) => {
    const { balance }: any = await doFetch(
      () => fetchBalancePerBrand(_selectedFan.id),
      true
    );
    setWallets(balance);
    setSelectedFan(_selectedFan);
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
