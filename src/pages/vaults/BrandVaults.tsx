import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import moment from "moment";
import { useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { deleteBrandVault } from "services/DiscoClubService";
import CopyIdToClipboard from "components/CopyIdToClipboard";
import { BrandVault } from "interfaces/BrandVault";
import { SelectBrandVault } from "components/SelectBrandVault";

const BrandVaults: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/vault`;
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });

  const {
    filteredArrayList: filteredBrandVaults,
    addFilterFunction,
    removeFilterFunction,
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
    {
      title: "Actions",
      key: "action",
      width: "10%",
      align: "right",
      render: (_, record: BrandVault) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteBrandVault(record)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const onChangeBrand = async (_selectedVault: BrandVault | undefined) => {
    if (!_selectedVault) {
      removeFilterFunction("shopName");
      return;
    }
    addFilterFunction("shopName", (vaults) =>
      vaults.filter((vault) => vault.shopName === _selectedVault.shopName)
    );
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
        <Col xxl={40} lg={6} xs={18}>
          <SelectBrandVault
            style={{ width: "100%" }}
            allowClear={true}
            onChange={onChangeBrand}
          ></SelectBrandVault>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredBrandVaults}
        loading={loading}
      />
    </div>
  );
};

export default BrandVaults;
