import { Avatar, Button, PageHeader, Popconfirm, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Brand } from "interfaces/Brand";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { fetchBrands } from "services/DiscoClubService";

const deleteItem = (id: string) => {};

const columns: ColumnsType<Brand> = [
  { title: "Brand Name", dataIndex: "brandName", width: "60%" },
  {
    title: "Brand Color",
    dataIndex: "brandTxtColor",
    width: "30%",
    align: "center",
    render: (value) => (
      <Avatar style={{ backgroundColor: value, border: "1px solid #9c9c9c" }} />
    ),
  },
  {
    title: "actions",
    key: "action",
    width: "5%",
    align: "right",
    render: (value, record) => (
      <>
        <Link to={{ pathname: `/brand`, state: record }}>
          <EditOutlined />
        </Link>
        <Popconfirm
          title="Are you sure？"
          okText="Yes"
          cancelText="No"
          onConfirm={() => deleteItem(record.id)}>
          <Button type="link" style={{ padding: 0, margin: 6 }}>
            <DeleteOutlined />
          </Button>
        </Popconfirm>
      </>
    ),
  },
];

const Brands: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      const response: any = await fetchBrands();
      if (mounted) {
        setLoading(false);
        setBrands(response.results);
      }
    };
    fetch();
  }, []);

  return (
    <div className="brands">
      <PageHeader
        title="Brands"
        subTitle="List of Brands"
        extra={[
          <Button key="1" onClick={() => history.push("/brand")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={brands}
        loading={loading}
      />
    </div>
  );
};

export default Brands;
