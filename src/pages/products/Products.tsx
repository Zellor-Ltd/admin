import { RouteComponentProps } from "react-router";
import { Button, PageHeader, Popconfirm, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Product } from "interfaces/Product";
import { useEffect, useState } from "react";
import { fetchProducts } from "services/DiscoClubService";
import { Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const deleteItem = (id: string) => {
  // deleteVideoFeed(id);
};

const columns: ColumnsType<Product> = [
  { title: "Name", dataIndex: "name", width: "15%" },
  {
    title: "Brand",
    dataIndex: ["brand", "brandName"],
    width: "15%",
    align: "center",
  },
  {
    title: "Related Videos",
    dataIndex: "relatedVideos",
    width: "15%",
    align: "center",
    render: (videos = []) => <Tag>{videos.length}</Tag>,
  },

  {
    title: "Expiration Date",
    dataIndex: "offerExpirationDate",
    width: "15%",
    align: "center",
    render: (creationDate: Date) => new Date(creationDate).toLocaleDateString(),
  },
  {
    title: "actions",
    key: "action",
    width: "5%",
    align: "right",
    render: (value, record) => (
      <>
        <Link to={{ pathname: `/product`, state: record }}>
          <EditOutlined />
        </Link>
        <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
          <Button type="link" style={{ padding: 0, margin: 6 }}>
            <DeleteOutlined onClick={() => deleteItem(record.id)} />
          </Button>
        </Popconfirm>
      </>
    ),
  },
];

const Products: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[] | undefined>();

  useEffect(() => {
    let mounted = true;
    const fetchVideos = async () => {
      setLoading(true);
      const response: any = await fetchProducts();
      if (mounted) {
        setLoading(false);
        setProducts(response.results);
      }
    };

    fetchVideos();
  }, []);

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
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={loading}
      />
    </div>
  );
};

export default Products;
