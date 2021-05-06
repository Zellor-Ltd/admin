import React, { useEffect, useState } from "react";
import {
  Button,
  PageHeader,
  Layout,
  Table,
  Tag as AntTag,
  Popconfirm,
  message,
  Modal,
} from "antd";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { ColumnsType } from "antd/es/table";
import {
  deleteVideoFeed,
  fetchVideoFeed,
  rebuildAllFeedd,
} from "services/DiscoClubService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response: any = await fetchVideoFeed();
      setLoading(false);
      setVideos(response.results);
    } catch (error) {
      message.error("Error to get feed");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const deleteItem = async (id: string) => {
    setLoading(true);
    await deleteVideoFeed({ id });
    fetchVideos();
  };

  const onRebuildFeed = async () => {
    await rebuildAllFeedd();
    message.success("All feeds was rebuilt");
  };

  const onRebuildFeedClick = () => {
    Modal.error({
      title: "Caution!!",
      content:
        "This action can't be undone and will remove and then generate feed for all Disco Fans. Are you sure you want to proceed?",
      onOk: onRebuildFeed,
      okText: "Rebuild",
      okButtonProps: { danger: true },
      closable: true,
      onCancel: () => {},
    });
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
      render: (value, record) => (
        <>
          <Link to={{ pathname: `/video-feed`, state: record }}>
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
    <div className="video-feed">
      <PageHeader
        title="Video feed update"
        subTitle="List of Feeds"
        extra={[
          <Button onClick={onRebuildFeedClick} danger key="1" type="primary">
            Rebuild all fields
          </Button>,
          <Button key="2" onClick={() => history.push("/video-feed")}>
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
