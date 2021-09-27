import { Button, Col, PageHeader, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SelectBrand } from "components/SelectBrand";
import useFilter from "hooks/useFilter";
import { Brand } from "interfaces/Brand";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import CopyIdToClipboard from "components/CopyIdToClipboard";
import { BrandVault } from "../../interfaces/BrandVault";

const BrandVaults: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/vault`;
  const [shopName, setShopName] = useState<string | undefined>("");

  const {
    arrayList: vaults,
    setArrayList: setVaults,
    filteredArrayList: filteredVaults,
    addFilterFunction,
  } = useFilter<BrandVault>([]);

  const columns: ColumnsType<BrandVault> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "6%",
      render: (id) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    {
      title: "Key",
      dataIndex: "key",
      width: "12%",
      align: "center",
    },
    {
      title: "Shop Name",
      dataIndex: "shopName",
      width: "20%",
      align: "center",
    },
    {
      title: "API Shop Name",
      dataIndex: "apiShopName",
      width: "20%",
      align: "center",
    },
    {
      title: "Token",
      dataIndex: "token",
      width: "10%",
      align: "center",
    },
    {
      title: "Creation",
      dataIndex: "hCreationDate",
      width: "15%",
      align: "center",
      render: (value: Date) => (
        <>
          <div>{moment(value).format("DD/MM/YYYY")}</div>
          <div>{moment(value).format("HH:mm")}</div>
        </>
      ),
    },
  ];

  useEffect(() => {
    const getResources = async () => {
      const vaultsWithShopName = vaults.filter((vault) => {
        return vault.shopName === shopName;
      });
      setVaults(vaultsWithShopName);
    };
    getResources();
  }, [setVaults]);

  const onChangeBrand = async (_selectedBrand: Brand) => {
    addFilterFunction("shopName", (vaults) =>
      vaults.filter((vault) => vault.shopName === _selectedBrand.shopName)
    );
    setShopName(_selectedBrand.shopName);
  };

  return (
    <div>
      <PageHeader
        title="Brand Vaults"
        subTitle="List of Brand Vaults"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <Row gutter={8}>
        <Col lg={8} xs={16}>
          <SelectBrand
            style={{ width: "100%" }}
            allowClear={true}
            onChange={onChangeBrand}
          ></SelectBrand>
        </Col>
      </Row>
      <Table rowKey="id" columns={columns} dataSource={filteredVaults} />
    </div>
  );
};

export default BrandVaults;
