import { EditOutlined } from "@ant-design/icons";
import { Col, PageHeader, Row, Select, Table, Tabs, Tag as AntTag } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Fan } from "interfaces/Fan";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  fetchFans,
  fetchUserFeed,
  fetchVideoFeed,
} from "services/DiscoClubService";

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};
const FeedMixer: React.FC<RouteComponentProps> = () => {
  const [userFeedLoading, setUserFeedLoading] = useState<boolean>(false);

  const [fans, setFans] = useState<Fan[]>([]);
  const [userFeed, setUserFeed] = useState([]);
  const [templateFeed, setTemplateFeed] = useState([]);

  const [searchList, setSearchList] = useState<string[]>([]);
  const [selectedFan, setSelectedFan] = useState<string>();

  const columns: ColumnsType<FeedItem> = [
    {
      title: "Title",
      dataIndex: "title",
      width: "15%",
      render: (value: string, record: FeedItem) => (
        <Link to={{ pathname: `/video-feed`, state: record }}>{value}</Link>
      ),
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
      render: (_, record: FeedItem) => (
        <>
          <EditOutlined />
        </>
      ),
    },
  ];

  const onChangeFan = async (value: string) => {
    setSelectedFan(value);
    const { id: userId } = fans.find(
      (fan) => fan.name === value || fan.email === value
    ) as Fan;
    setUserFeedLoading(true);

    if (!templateFeed.length) {
      const [{ results: _userFeed }, { results: _templateFeed }]: [any, any] =
        await Promise.all([fetchUserFeed(userId), fetchVideoFeed()]);
      setUserFeed(_userFeed);
      setTemplateFeed(_templateFeed);
    } else {
      const { results }: any = await fetchUserFeed(userId);
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

  return (
    <div className="feed-mixer">
      <PageHeader title="Feed Mixer" />
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
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="User Feed" key="1">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={userFeed}
            loading={userFeedLoading}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Template Feed" key="2">
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
