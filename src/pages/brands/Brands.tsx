import { Avatar, Button, PageHeader, Popconfirm, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Brand } from "interfaces/Brand";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { deleteBrand, fetchBrands, saveBrand } from "services/DiscoClubService";

const tagColorByStatus: any = {
  approved: "green",
  rejected: "red",
  pending: "",
};

const Brands: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  const aproveOrReject = async (aprove: boolean, creator: Brand) => {
    creator.status = aprove ? "approved" : "rejected";
    setLoading(true);
    await saveBrand(creator);
    fetch();
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await deleteBrand(id);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchBrands();
    setLoading(false);
    setBrands(response.results);
  };

  useEffect(() => {
    fetch();
  }, []);

  const columns: ColumnsType<Brand> = [
    { title: "Brand Name", dataIndex: "brandName", width: "50%" },
    {
      title: "Brand Color",
      dataIndex: "brandTxtColor",
      width: "20%",
      align: "center",
      render: (value) => (
        <Avatar
          style={{ backgroundColor: value, border: "1px solid #9c9c9c" }}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: "20%",
      align: "center",
      render: (value = "pending") => (
        <Tag color={tagColorByStatus[value]}>{value}</Tag>
      ),
    },
    {
      title: "actions",
      key: "action",
      width: "10%",
      align: "right",
      render: (value, record) => (
        <>
          {!record.status && [
            <CheckOutlined
              key="approve"
              style={{ color: "green" }}
              onClick={() => aproveOrReject(true, record)}
            />,
            <CloseOutlined
              key="reject"
              style={{ color: "red", margin: "6px" }}
              onClick={() => aproveOrReject(false, record)}
            />,
          ]}
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
