import { MinusOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Image as AntImage,
  Input,
  message,
  PageHeader,
  Space,
  Tabs,
} from "antd";
import Table, { ColumnsType } from "antd/lib/table";
import { SortableTable } from "components";
import useAllCategories from "hooks/useAllCategories";
import { useRequest } from "hooks/useRequest";
import { ProductCategory } from "interfaces/Category";
import { FeedItem } from "interfaces/FeedItem";
import { Image } from "interfaces/Image";
import React, { useEffect, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { fetchInterests } from "services/DiscoClubService";

interface InterestsProps {}

const Interests: React.FC<InterestsProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });
  const { doFetch, doRequest } = useRequest({ setLoading });

  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");

  const [selectedTab, setSelectedTab] = useState<string>("");

  const [interests, setInterests] = useState<any[]>([]);
  const [mergedCategories, setMergedCategories] = useState<any[]>([]);

  useEffect(() => {
    if (!allCategories["Super Category"].length) return;

    const getCategoryParams = (category: ProductCategory) => ({
      searchTags: category.searchTags,
      image: category.image,
      hCreationDate: category.hCreationDate,
      hLastUpdate: category.hLastUpdate,
    });

    const _mergedCategories: any[] = [];

    allCategories["Category"].forEach((category) => {
      _mergedCategories.push({
        category: category.category,
        categoryId: category.id,
        ...getCategoryParams(category),
      });
    });
    allCategories["Sub Category"].forEach((category) => {
      _mergedCategories.push({
        category: category.subCategory,
        subCategoryId: category.id,
        ...getCategoryParams(category),
      });
    });
    allCategories["Sub Sub Category"].forEach((category) => {
      _mergedCategories.push({
        category: category.subSubCategory,
        subSubCategoryId: category.id,
        ...getCategoryParams(category),
      });
    });

    setMergedCategories(_mergedCategories);
  }, [allCategories]);

  const searchInput = useRef<Input>(null);

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex: any) => ({
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

  const addInterest = (record: FeedItem, _: number) => {
    setInterests((prev) => [record, ...prev]);
    message.success("Category added into interests.");
  };

  const removeInterest = (_: FeedItem, index: number) => {
    setInterests((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const addObj = { icon: <PlusOutlined />, fn: addInterest };
  const removeObj = { icon: <MinusOutlined />, fn: removeInterest };

  const [actionObj, setActionObj] =
    useState<{ icon: any; fn: (record: FeedItem, index: number) => void }>(
      removeObj
    );

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setActionObj(tab === "Interests" ? removeObj : addObj);
  };

  useEffect(() => {
    const getResources = async () => {
      const [{ results: _interests }] = await Promise.all([
        doFetch(fetchInterests),
        fetchAllCategories(),
      ]);
      setInterests(_interests);
    };
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<FeedItem> = [
    {
      title: "Title",
      dataIndex: "category",
      width: "15%",
      ...(() =>
        selectedTab === "All Categories"
          ? getColumnSearchProps("category")
          : {})(),
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
      render: (_, record, index) => (
        <Button
          onClick={() => actionObj.fn(record, index)}
          type="link"
          style={{ padding: 0, margin: "0 6px" }}
        >
          {actionObj.icon}
        </Button>
      ),
    },
  ];

  return (
    <div className="interests">
      <PageHeader title="Interests" />
      <Tabs defaultActiveKey="Interests" onChange={handleTabChange}>
        <Tabs.TabPane tab="Interests" key="Interests">
          <SortableTable
            rowKey="id"
            columns={columns}
            dataSource={interests}
            setDataSource={setInterests}
            loading={loading}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="All Categories" key="All Categories">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={mergedCategories}
            loading={loading}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Interests;
