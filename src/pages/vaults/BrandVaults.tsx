import { Button, Col, PageHeader, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SelectBrand } from "components/SelectBrand";
import { Brand } from "interfaces/Brand";
import moment from "moment";
import { useState } from "react";
import { useRequest } from "hooks/useRequest";
import { Link, RouteComponentProps } from "react-router-dom";
import CopyIdToClipboard from "components/CopyIdToClipboard";
import { BrandVault } from "../../interfaces/BrandVault";
import { fetchBrandVault } from "services/DiscoClubService";

const BrandVaults: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/vault`;
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [vaults, setVaults] = useState<BrandVault[]>([]);

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

  const onChangeBrand = async (_selectedBrand: Brand) => {
    const { results } = await doFetch(() =>
      fetchBrandVault(_selectedBrand?.shopName || "")
    );
    setVaults(results);
    console.log(results);
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
            allowClear={false}
            onChange={onChangeBrand}
          ></SelectBrand>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={vaults}
        loading={loading}
      />
    </div>
  );
};

export default BrandVaults;
