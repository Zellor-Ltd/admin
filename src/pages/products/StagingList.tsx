import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tag,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import { SelectBrand } from "components/SelectBrand";
import useFilter from "hooks/useFilter";
import { Brand } from "interfaces/Brand";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deleteStagingProduct,
  fetchStagingProducts,
  transferStageProduct,
} from "services/DiscoClubService";

const StagingList: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const {
    setArrayList: setProducts,
    filteredArrayList: filteredProducts,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Product>([]);

  const fetch = useCallback(async () => {
    setLoading(true);
    const response: any = await fetchStagingProducts();
    setLoading(false);
    setProducts(response.results);
  }, [setProducts]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      await deleteStagingProduct(id);
      await fetch();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const handleStage = async (productId: string) => {
    try {
      await transferStageProduct(productId);
      fetch();
      message.success("Product sent to stage");
    } catch (err) {
      message.success("Error at staging product");
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name",
      width: "15%",
      render: (value: string, record: Product) => (
        <Link to={{ pathname: `/product/staging`, state: record }}>
          {value}
        </Link>
      ),
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "15%",
      align: "center",
    },
    {
      title: "Related Videos",
      dataIndex: "relatedVideoFeed",
      width: "15%",
      align: "center",
      render: (videos = []) => <Tag>{videos.length}</Tag>,
    },
    {
      title: "Expiration Date",
      dataIndex: "offerExpirationDate",
      width: "15%",
      align: "center",
      render: (creationDate: Date) => moment(creationDate).format("DD/MM/YYYY"),
    },
    {
      title: "Last Import",
      dataIndex: "lastImportDate",
      width: "15%",
      align: "center",
      render: (lastImportDate: Date | null | undefined) =>
        lastImportDate ? (
          <>
            <div>{moment(lastImportDate).format("DD/MM/YYYY")}</div>
            <div>{moment(lastImportDate).format("HH:mm")}</div>
          </>
        ) : (
          ""
        ),
    },
    {
      title: "actions",
      key: "action",
      width: "12%",
      align: "right",
      render: (_, record: Product) => (
        <>
          <Link to={{ pathname: `/product/staging`, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, marginLeft: 8 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
          <Button
            onClick={() => handleStage(record.id)}
            type="link"
            style={{ color: "green", padding: 0, margin: 6 }}
          >
            <ArrowRightOutlined />
          </Button>
        </>
      ),
    },
  ];

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("productName", (products) =>
      products.filter((product) =>
        product.name?.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction("brandName");
      return;
    }
    addFilterFunction("brandName", (products) =>
      products.filter(
        (product) => product.brand.brandName === _selectedBrand.brandName
      )
    );
  };

  return (
    <>
      <PageHeader title="Staging" subTitle="List of Staging Products" />
      <Row gutter={8}>
        <Col xxl={40} lg={6} xs={18}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by Name"
          />
        </Col>
        <Col xxl={40} lg={6} xs={18}>
          <SelectBrand
            style={{ width: "100%" }}
            allowClear={true}
            onChange={onChangeBrand}
          ></SelectBrand>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
      />
    </>
  );
};

export default StagingList;
