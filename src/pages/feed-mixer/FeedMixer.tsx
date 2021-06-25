import { MinusOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Input,
  message,
  PageHeader,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag as AntTag,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { SortableTable } from "components";
import { Fan } from "interfaces/Fan";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import React, { useEffect, useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
// import { Link } from "react-router-dom";
import {
  fetchFans,
  fetchUserFeed,
  fetchVideoFeed,
  saveUserFeed,
} from "services/DiscoClubService";
import Highlighter from "react-highlight-words";

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};
const FeedMixer: React.FC<RouteComponentProps> = () => {
  const [userFeedLoading, setUserFeedLoading] = useState<boolean>(false);

  const [fans, setFans] = useState<Fan[]>([]);
  const [userFeed, setUserFeed] = useState<any[]>([]);
  const [templateFeed, setTemplateFeed] = useState([]);

  const [searchList, setSearchList] = useState<string[]>([]);
  const [selectedFan, setSelectedFan] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("");

  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");

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

  const addVideo = (index: number) => {
    setUserFeed((prev) => [templateFeed[index], ...prev]);
    message.success("Video added into user feed.");
  };

  const removeVideo = (index: number) => {
    setUserFeed((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const addObj = { icon: <PlusOutlined />, fn: addVideo };
  const removeObj = { icon: <MinusOutlined />, fn: removeVideo };

  const [actionObj, setActionObj] =
    useState<{ icon: any; fn: Function }>(removeObj);

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setActionObj(tab === "User Feed" ? removeObj : addObj);
  };

  const columns: ColumnsType<FeedItem> = [
    {
      title: "Title",
      dataIndex: "title",
      width: "15%",
      // render: (value: string, record: FeedItem) => (
      //   <Link to={{ pathname: `/video-feed`, state: record }}>{value}</Link>
      // ),
      align: "center",
      ...(() =>
        selectedTab === "Template Feed" ? getColumnSearchProps("title") : {})(),
    },
    {
      title: "Segments",
      dataIndex: "package",
      render: (pack: Array<any> = []) => <AntTag>{pack.length}</AntTag>,
      width: "5%",
      align: "center",
    },
    {
      title: "Length",
      dataIndex: "lengthTotal",
      width: "5%",
      align: "center",
    },
    {
      title: "Expiration Date",
      dataIndex: "validity",
      width: "5%",
      render: (creationDate: Date) =>
        new Date(creationDate).toLocaleDateString(),
      align: "center",
    },
    {
      title: "Tags",
      dataIndex: "package",
      width: "5%",
      render: (pack: Array<any> = []) => (
        <AntTag>{reduceSegmentsTags(pack)}</AntTag>
      ),
      align: "center",
    },
    {
      title: "actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, __, index) => {
        return (
          <Button
            onClick={() => actionObj.fn(index)}
            type="link"
            style={{ padding: 0, margin: 6 }}
          >
            {actionObj.icon}
          </Button>
        );
      },
    },
  ];

  const getFanId = (value: string) => {
    const { id: fanId } = fans.find(
      (fan) => fan.name === value || fan.email === value
    ) as Fan;
    return fanId;
  };

  const onChangeFan = async (value: string) => {
    const fanId = getFanId(value);
    setSelectedFan(value);
    setUserFeedLoading(true);

    if (!templateFeed.length) {
      const [{ results: _userFeed }, { results: _templateFeed }]: [any, any] =
        await Promise.all([fetchUserFeed(fanId), fetchVideoFeed()]);
      setUserFeed(_userFeed);
      setTemplateFeed(_templateFeed);
    } else {
      const { results }: any = await fetchUserFeed(fanId);
      setUserFeed(results);
    }
    setUserFeedLoading(false);
  };

  useEffect(() => {
    const getFans = async () => {
      try {
        const { results }: any = await fetchFans();
        const _searchList: string[] = [];
        results.forEach((fan: Fan) => {
          if (fan.name) _searchList.unshift(fan.name);
          if (fan.email) _searchList.push(fan.email);
        });
        setSearchList(_searchList);
        setFans(results);
      } catch (e) {}
    };
    getFans();
  }, []);

  const saveChanges = async () => {
    setUserFeedLoading(true);
    await saveUserFeed(getFanId(selectedFan), userFeed);
    message.success("User feed updated.");
    setUserFeedLoading(false);
  };

  return (
    <div className="feed-mixer">
      <PageHeader
        title="Feed Mixer"
        extra={[
          <Button key="1" onClick={saveChanges}>
            Save Changes
          </Button>,
        ]}
      />
      <Row gutter={8} style={{ marginBottom: "20px" }}>
        <Col xxl={40} lg={6} xs={18}>
          <Select
            showSearch
            placeholder="Select a fan"
            style={{ width: "100%" }}
            onChange={onChangeFan}
            value={selectedFan}
          >
            {searchList.map((value) => (
              <Select.Option key={value} value={value}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Tabs defaultActiveKey="User Feed" onChange={handleTabChange}>
        <Tabs.TabPane tab="User Feed" key="User Feed">
          <SortableTable
            rowKey="id"
            columns={columns}
            dataSource={userFeed}
            setDataSource={setUserFeed}
            loading={userFeedLoading}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Template Feed" key="Template Feed">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={templateFeed}
            loading={userFeedLoading}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default FeedMixer;
