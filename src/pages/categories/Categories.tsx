import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Image as AntImage,
  Input,
  Menu,
  PageHeader,
  Popconfirm,
  Space,
  Table,
  Tabs,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { categoriesSettings } from "helpers/utils";
import useAllCategories from "hooks/useAllCategories";
import {
  AllCategories,
  AllCategoriesAPI,
  ProductCategory,
} from "interfaces/Category";
import { Image } from "interfaces/Image";
import { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { Link, RouteComponentProps } from "react-router-dom";
import { productCategoriesAPI } from "services/DiscoClubService";

const { categoriesKeys, categoriesFields } = categoriesSettings;

const Categories: React.FC<RouteComponentProps> = ({ location }) => {
  const detailsPathname = `${location.pathname}/category`;
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });
  const [selectedTab, setSelectedTab] = useState<string>("Super Category");

  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");
  const searchInput = useRef<Input>(null);

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

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex: string) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: any;
      selectedKeys: any;
      confirm: any;
      clearFilters: any;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value: any, record: any) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.current!.select(), 100);
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns: ColumnsType<ProductCategory> = [
    {
      title: "Name",
      width: "15%",
      ...getColumnSearchProps(
        categoriesFields[
          categoriesKeys.indexOf(selectedTab)
        ] as keyof ProductCategory
      ),
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
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record) => (
        <>
          <Link
            to={{
              pathname: detailsPathname,
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
                        pathname: detailsPathname,
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
