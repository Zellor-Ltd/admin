import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Tag } from "antd";
import { SearchFilter } from "components/SearchFilter";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  fetchProducts,
  saveProduct,
} from "services/DiscoClubService";
import EditableTable, { EditableColumnType } from "components/EditableTable";
import ProductExpandedRow from "./ProductExpandedRow";
import useAllCategories from "hooks/useAllCategories";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";

const Products: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();

  const {
    setArrayList: setProducts,
    filteredArrayList: filteredProducts,
    addFilterFunction,
  } = useFilter<Product>([]);

  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });

  const getResources = useCallback(async () => {
    const [products] = await Promise.all([
      doFetch(fetchProducts),
      fetchAllCategories(),
    ]);
    setProducts(products);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProducts = async () => {
    const products = await doFetch(fetchProducts);
    setProducts(products);
  };

  useEffect(() => {
    getResources();
  }, [getResources]);

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteProduct({ id }));
    await getProducts();
  };

  const onSaveCategories = async (record: Product) => {
    await saveCategories(() => saveProduct(record));
  };

  const onSaveProduct = async (record: Product) => {
    await doRequest(() => saveProduct(record));
    await getProducts();
  };

  const expandedRowRender = (record: Product) => {
    return (
      <ProductExpandedRow
        key={record.id}
        record={record}
        allCategories={allCategories}
        onSaveProduct={onSaveCategories}
        loading={loadingCategories}
      ></ProductExpandedRow>
    );
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: "Name",
      dataIndex: "name",
      width: "25%",
      render: (value: string, record) => (
        <Link to={{ pathname: `/product/commited`, state: record }}>
          {value}
        </Link>
      ),
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "20%",
      align: "center",
    },
    {
      title: "Max Disco Dollars",
      dataIndex: "maxDiscoDollars",
      width: "12%",
      align: "center",
      editable: true,
      number: true,
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
      title: "actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_: any, record) => (
        <>
          <Link to={{ pathname: `/product/commited`, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
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

  return (
    <div className="products">
      <PageHeader
        title="Products"
        subTitle="List of Products"
        extra={[
          <Button key="1" onClick={() => history.push("/product/commited/0")}>
            New Item
          </Button>,
        ]}
      />
      <Row>
        <Col lg={12} xs={24}>
          <SearchFilter filterFunction={searchFilterFunction} />
        </Col>
      </Row>
      <EditableTable
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        onSave={onSaveProduct}
        expandable={{ expandedRowRender }}
      />
    </div>
  );
};

export default Products;
