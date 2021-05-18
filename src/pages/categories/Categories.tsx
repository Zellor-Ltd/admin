import { Button, PageHeader, Popconfirm, Table, Image as AntImage } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Category } from "interfaces/Category";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Image } from "interfaces/Image";
import { deleteCategory, fetchCategories } from "services/DiscoClubService";

const Categories: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchCategories();
    setLoading(false);
    setCategories(response.results);
  };

  useEffect(() => {
    fetch();
  }, []);

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      await deleteCategory({ id });
      fetch();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Category> = [
    { title: "Name", dataIndex: "name", width: "15%" },
    {
      title: "Image",
      dataIndex: "image",
      width: "15%",
      render: (image: Image) => <AntImage src={image?.url} width={70} />,
    },
    {
      title: "actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <>
          <Link to={{ pathname: `/category`, state: record }}>
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

  return (
    <div className="categories">
      <PageHeader
        title="Categories"
        subTitle="List of categories"
        extra={[
          <Button key="1" onClick={() => history.push("/category")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={loading}
      />
    </div>
  );
};

export default Categories;
