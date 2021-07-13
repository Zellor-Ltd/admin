import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deleteProduct,
  fetchProducts,
  saveProduct,
} from "services/DiscoClubService";
import { EditableCell, EditableRow } from "components";
import { ColumnTypes } from "components/editable-context";

const Products: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchProducts();
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
      await deleteProduct({ id });
      await fetch();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: "15%",
      render: (value: string, record: Product) => (
        <Link to={{ pathname: `/product/commited`, state: record }}>
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
      title: "Max Disco Dollars",
      dataIndex: "maxDiscoDollars",
      width: "12%",
      align: "center",
      editable: true,
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
      render: (_: any, record: Product) => (
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
    setFilteredProducts(
      products.filter((product) =>
        product.name?.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  const onSaveProduct = async (record: Product) => {
    setLoading(true);
    await saveProduct(record);
    fetch();
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const configuredColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Product, index: number) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        onSave: onSaveProduct,
      }),
    };
  });

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
      <Table
        rowKey="id"
        columns={configuredColumns as ColumnTypes}
        dataSource={filteredProducts}
        components={components}
        loading={loading}
      />
    </div>
  );
};

export default Products;
