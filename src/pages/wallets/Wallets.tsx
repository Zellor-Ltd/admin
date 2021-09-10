import { Col, PageHeader, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SelectBrand } from "components/SelectBrand";
import { SelectFan } from "components/SelectFan";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { Brand } from "interfaces/Brand";
import { Fan } from "interfaces/Fan";
import { Wallet } from "interfaces/Wallet";
import { WalletDetailParams } from "interfaces/WalletTransactions";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchBalancePerBrand } from "services/DiscoClubService";
import WalletEdit from "./WalletEdit";

const Wallets: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFan, setSelectedFan] = useState<Fan>();
  const [selectedBrand, setSelectedBrand] = useState<Brand>();
  const { doFetch } = useRequest({ setLoading: setLoading });

  const {
    // arrayList: wallets,
    setArrayList: setWallets,
    filteredArrayList: filteredWallets,
    addFilterFunction,
    removeFilterFunction,
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

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction("brandName");
      return;
    }
    addFilterFunction("brandName", (wallets) =>
      wallets.filter((wallet) => wallet.brandName === _selectedBrand.brandName)
    );
    setSelectedBrand(_selectedBrand);
  };

  return (
    <div className="wallets">
      <PageHeader title="Fan Wallets" subTitle="List of fan wallets" />
      <Row align="bottom" justify="space-between">
        <Col lg={24} xs={24}>
          <Row gutter={8}>
            <Col lg={6} xs={12}>
              <SelectFan onChange={onChangeFan} style={{ width: "100%" }} />
            </Col>
            <Col lg={6} xs={12}>
              <SelectBrand
                style={{ width: "100%" }}
                allowClear={true}
                onChange={onChangeBrand}
              ></SelectBrand>
            </Col>
            {selectedFan && selectedBrand && (
              <>
                <WalletEdit
                  fanId={selectedFan.id}
                  brandId={selectedBrand.id}
                  getResources={() => onChangeFan(selectedFan)}
                  label="Manage DDs"
                />
              </>
            )}
          </Row>
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
