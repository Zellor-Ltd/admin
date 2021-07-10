import {
  Button,
  PageHeader,
  Popconfirm,
  Table,
  Image as AntImage,
  Tabs,
  Menu,
  Dropdown,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import {
  ProductCategory,
  AllCategories,
  AllCategoriesAPI,
} from "interfaces/Category";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Image } from "interfaces/Image";
import { productCategoriesAPI } from "services/DiscoClubService";
import { categoriesSettings } from "helpers/utils";
import useAllCategories from "hooks/useAllCategories";

const { categoriesKeys, categoriesFields } = categoriesSettings;

const Categories: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchAllCategories, _allCategories: allCategories } =
    useAllCategories({ setLoading });
  const [selectedTab, setSelectedTab] = useState<string>("Super Category");

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      const selectedField = categoriesFields[
        categoriesKeys.indexOf(selectedTab)
      ] as keyof AllCategoriesAPI;
      await productCategoriesAPI[
        selectedField as keyof AllCategoriesAPI
      ].delete({
        id,
      });
      fetchAllCategories();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ProductCategory> = [
    {
      title: "Name",
      width: "15%",
      render: (_, record) => (
        <>
          {
            record[
              categoriesFields[
                categoriesKeys.indexOf(selectedTab)
              ] as keyof ProductCategory
            ]
          }
        </>
      ),
    },
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
      render: (_, record) => (
        <>
          <Link
            to={{
              pathname: `/category`,
              search: `?category-level=${categoriesKeys.indexOf(selectedTab)}`,
              state: record,
            }}
          >
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

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="categories">
      <PageHeader
        title="Categories"
        subTitle="List of categories"
        extra={[
          <Dropdown
            overlay={
              <Menu>
                {categoriesKeys.map((key, index) => (
                  <Menu.Item>
                    <Link
                      to={{
                        pathname: `/category`,
                        search: `?category-level=${index}`,
                      }}
                    >
                      {key}
                    </Link>
                  </Menu.Item>
                ))}
              </Menu>
            }
            trigger={["click"]}
          >
            <Button>New Item</Button>
          </Dropdown>,
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
