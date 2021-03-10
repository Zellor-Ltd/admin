import React, { useEffect, useState } from "react";
import {
  Button,
  PageHeader,
  Layout,
  Table,
  Tag as AntTag,
  Popconfirm,
} from "antd";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import { fetchVideoFeed } from "services/DiscoClubService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FeedItem } from "interfaces/FeedItem";
import { Tag } from "interfaces/Tag";

const { Content } = Layout;

const deleteItem = (id: string) => {
  // deleteVideoFeed(id);
};

const columns: ColumnsType<FeedItem> = [
  { title: "Title", dataIndex: ["video", "title"], width: "15%" },
  {
    title: "Image URL",
    dataIndex: ["video", "thumbnailUrl"],
    width: "25%",
    align: "center",
  },
  {
    title: "Video URL",
    dataIndex: ["video", "videoUrl"],
    width: "25%",
    align: "center",
  },
  {
    title: "Tags",
    dataIndex: ["tags", "length"],
    width: "5%",
    align: "center",
  },
  {
    title: "Brands",
    dataIndex: ["brands", "length"],
    width: "5%",
    align: "center",
  },
  {
    title: "Dollars",
    dataIndex: "tags",
    render: (tags: Array<Tag> = []) =>
      tags.map((tag, index) => (
        <AntTag key={`dolar_${index}`}>{tag.discoDollars}</AntTag>
      )),
    width: "10%",
    align: "center",
  },
  {
    title: "Gold",
    dataIndex: "tags",
    render: (tags: Array<Tag> = []) =>
      tags.map((tag, index) => (
        <AntTag key={`dolar_${index}`}>{tag.discoGold}</AntTag>
      )),
    width: "10%",
    align: "center",
  },
  {
    title: "actions",
    key: "action",
    width: "5%",
    align: "right",
    render: (value, record) => (
      <>
        <Link to={{ pathname: `/video-feed/${record.id}`, state: record }}>
          <EditOutlined />
        </Link>
        <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
          <Button type="link" style={{ padding: 0, margin: 6 }}>
            <DeleteOutlined onClick={() => deleteItem(record.id)} />
          </Button>
        </Popconfirm>
      </>
    ),
  },
];

const VideoFeed: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchVideos = async () => {
      setLoading(true);
      const response: any = await fetchVideoFeed();
      if (mounted) {
        setLoading(false);
        setVideos(response.results);
      }
    };

    fetchVideos();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="video-feed">
      <PageHeader
        title="Video feed update"
        subTitle="List of Feeds"
        extra={[
          <Button key="1" onClick={() => history.push("/video-feed/0")}>
            New Item
          </Button>,
        ]}
      />
      <Content>
        <Table
          size="small"
          columns={columns}
          rowKey={(video: any) => video.id}
          dataSource={videos}
          loading={loading}
        />
      </Content>
    </div>
  );
};

export default withRouter(VideoFeed);
