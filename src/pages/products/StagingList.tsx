import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Button, message, PageHeader, Popconfirm, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deleteStagingProduct,
  fetchStagingProducts,
  transferStageProduct,
} from "services/DiscoClubService";

const StagingList: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchStagingProducts();
    setLoading(false);
    setProducts(response.results);
    setFilteredProducts(response.results);
  };

  useEffect(() => {
    fetch();
  }, []);

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
    setFilteredProducts(
      products.filter((product) =>
        product.name?.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <>
      <PageHeader title="Staging" subTitle="List of Staging Products" />
      <SearchFilter filterFunction={searchFilterFunction} />
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
