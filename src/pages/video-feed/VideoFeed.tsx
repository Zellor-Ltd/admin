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
import { deleteVideoFeed, fetchVideoFeed } from "services/DiscoClubService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";

const { Content } = Layout;

const deleteItem = (id: string) => {
  deleteVideoFeed(id);
};

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const columns: ColumnsType<FeedItem> = [
  { title: "Title", dataIndex: "title", width: "15%" },
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
    render: (creationDate: Date) => new Date(creationDate).toLocaleDateString(),
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
  // {
  //   title: "Gold",
  //   dataIndex: "tags",
  //   render: (tags: Array<Tag> = []) =>
  //     tags.map((tag, index) => (
  //       <AntTag key={`dolar_${index}`}>{tag.discoGold}</AntTag>
  //     )),
  //   width: "10%",
  //   align: "center",
  // },
  {
    title: "actions",
    key: "action",
    width: "5%",
    align: "right",
    render: (value, record) => (
      <>
        <Link to={{ pathname: `/video-feed`, state: record }}>
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
          <Button key="1" onClick={() => history.push("/video-feed")}>
            New Item
          </Button>,
        ]}
      />
      <Content>
        <Table
          size="small"
          columns={columns}
          rowKey="id"
          dataSource={videos}
          loading={loading}
        />
      </Content>
    </div>
  );
};

export default withRouter(VideoFeed);
