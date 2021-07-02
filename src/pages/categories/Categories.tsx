import {
  Button,
  PageHeader,
  Popconfirm,
  Table,
  Image as AntImage,
  Tabs,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { ProductCategory } from "interfaces/Category";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Image } from "interfaces/Image";
import {
  deleteCategory,
  fetchProductSuperCategories,
  fetchProductCategories,
  fetchProductSubCategories,
  fetchProductSubSubCategories,
} from "services/DiscoClubService";

const categoriesKeys = [
  "Super Category",
  "Category",
  "Sub Category",
  "Sub Sub Category",
];

type AllCategories =
  | {
      "Super Category": ProductCategory[];
      Category: ProductCategory[];
      "Sub Category": ProductCategory[];
      "Sub Sub Category": ProductCategory[];
    }
  | {};

const Categories: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [allCategories, setAllCategories] = useState<AllCategories>({});

  const fetch = async () => {
    setLoading(true);
    const responses: any[] = await Promise.all([
      fetchProductSuperCategories(),
      fetchProductCategories(),
      fetchProductSubCategories(),
      fetchProductSubSubCategories(),
    ]);
    setLoading(false);
    setAllCategories({
      "Super Category": responses[0].results,
      Category: responses[1].results,
      "Sub Category": responses[2].results,
      "Sub Sub Category": responses[3].results,
    });
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

  const columns: ColumnsType<ProductCategory> = [
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

  const handleTabChange = () => {};

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
      <Tabs onChange={handleTabChange}>
        {categoriesKeys.map((key) => (
          <Tabs.TabPane tab={key} key={key}>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={allCategories[key as keyof AllCategories]}
              loading={loading}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default Categories;
