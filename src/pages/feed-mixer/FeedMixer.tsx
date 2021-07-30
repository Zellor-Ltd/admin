import {
  StopOutlined,
  MinusOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Space,
  Switch,
  Table,
  Tabs,
  Tag as AntTag,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { SortableTable } from "components";
import { Fan } from "interfaces/Fan";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import React, { useRef, useState } from "react";
import { RouteComponentProps } from "react-router";
import {
  fetchUserFeed,
  fetchVideoFeed,
  lockFeedMixer,
  saveUserFeed,
  unlockFeedMixer,
} from "services/DiscoClubService";
import Highlighter from "react-highlight-words";

import { SelectFan } from "components/SelectFan";
import { SwitchChangeEventHandler } from "antd/lib/switch";
import { useRequest } from "hooks/useRequest";

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};
const FeedMixer: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });

  const [userFeed, setUserFeed] = useState<any[]>([]);
  const [templateFeed, setTemplateFeed] = useState<any[]>([]);

  const [selectedFan, setSelectedFan] = useState<Fan>();
  const [selectedTab, setSelectedTab] = useState<string>("");

  const [searchText, setSearchText] = useState<string>("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");

  const [lockedFeed, setLockedFeed] = useState<boolean>(false);

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

  const addVideo = (record: FeedItem, _: number) => {
    setUserFeed((prev) => [record, ...prev]);
    message.success("Video added into user feed.");
  };

  const removeVideo = (_: FeedItem, index: number) => {
    setUserFeed((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const addObj = { icon: <PlusOutlined />, fn: addVideo };
  const removeObj = { icon: <MinusOutlined />, fn: removeVideo };

  const [actionObj, setActionObj] =
    useState<{ icon: any; fn: (record: FeedItem, index: number) => void }>(
      removeObj
    );

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
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (_, record, index) =>
        !lockedFeed ? (
          <Button
            onClick={() => actionObj.fn(record, index)}
            type="link"
            style={{ padding: 0, margin: "0 6px" }}
          >
            {actionObj.icon}
          </Button>
        ) : (
          <StopOutlined
            style={{ color: "rgba(0, 0, 0, 0.25)", margin: "9px" }}
          />
        ),
    },
  ];

  const onChangeFan = async (_selectedFan: Fan) => {
    setSelectedFan(_selectedFan);

    if (!templateFeed.length) {
      const [{ results: _userFeed }, { results: _templateFeed }] =
        await Promise.all([
          doFetch(() => fetchUserFeed(_selectedFan.id)),
          doFetch(() => fetchVideoFeed()),
        ]);
      setUserFeed(_userFeed);
      setTemplateFeed(_templateFeed);
    } else {
      const { results } = await doFetch(() => fetchUserFeed(_selectedFan.id));
      setUserFeed(results);
    }
    setLockedFeed(Boolean(_selectedFan.specialLock));
  };

  const saveChanges = async () => {
    await doRequest(
      () => saveUserFeed(selectedFan!.id, userFeed),
      "User feed updated."
    );
  };

  const handleLockChange: SwitchChangeEventHandler = async (checked) => {
    await doRequest(() =>
      checked
        ? lockFeedMixer(selectedFan!.id)
        : unlockFeedMixer(selectedFan!.id)
    );
    setLockedFeed(checked);
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
          <SelectFan
            style={{ width: "100%" }}
            onChange={onChangeFan}
          ></SelectFan>
        </Col>
        <Col xxl={40} lg={6} xs={18}>
          <Form.Item label="Lock Feed" style={{ margin: "32px 0 16px 16px" }}>
            <Switch
              disabled={!selectedFan}
              loading={loading}
              onChange={handleLockChange}
              checked={lockedFeed}
            ></Switch>
          </Form.Item>
        </Col>
      </Row>
      <Tabs defaultActiveKey="User Feed" onChange={handleTabChange}>
        <Tabs.TabPane tab="User Feed" key="User Feed">
          {!lockedFeed ? (
            <SortableTable
              rowKey="id"
              columns={columns}
              dataSource={userFeed}
              setDataSource={setUserFeed}
              loading={loading}
            />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={userFeed}
              loading={loading}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane tab="Template Feed" key="Template Feed">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={templateFeed}
            loading={loading}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default FeedMixer;
