import { RouteComponentProps } from "react-router";
import {
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tag,
  Typography,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { Product } from "interfaces/Product";
import { useEffect, useState } from "react";
import {
  deleteProduct,
  fetchProducts,
  saveProduct,
} from "services/DiscoClubService";
import { Link } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import "./Products.scss";
import { EditableCell, EditableRow } from "components";
import { ColumnTypes } from "components/editable-context";

const Products: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterText, setFilterText] = useState("");

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchProducts();
    setLoading(false);
    setProducts(response.results);
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

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterProduct = () => {
    return products.filter((product) =>
      product.name?.toUpperCase().includes(filterText.toUpperCase())
    );
  };

  const columns = [
    { title: "Name", dataIndex: "name", width: "15%", editable: true },
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
      render: (creationDate: Date) =>
        new Date(creationDate).toLocaleDateString(),
    },
    {
      title: "actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value: any, record: Product) => (
        <>
          <Link to={{ pathname: `/product`, state: record }}>
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
          <Button key="1" onClick={() => history.push("/product/0")}>
            New Item
          </Button>,
        ]}
      />
      <div className="filter">
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={5} title="Search">
              Search
            </Typography.Title>
            <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
          </Col>
        </Row>
      </div>
      <Table
        rowKey="id"
        components={components}
        columns={configuredColumns as ColumnTypes}
        dataSource={filterProduct()}
        loading={loading}
      />
    </div>
  );
};

export default Products;
