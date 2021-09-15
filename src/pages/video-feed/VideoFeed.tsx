import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Layout,
  message,
  Modal,
  PageHeader,
  Popconfirm,
  Spin,
  Table,
  Tag as AntTag,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import React, { useEffect, useState } from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import {
  deleteVideoFeed,
  fetchVideoFeed,
  rebuildAllFeedd,
} from "services/DiscoClubService";
import InfiniteScroll from "react-infinite-scroll-component";
import CopyIdToClipboard from "components/CopyIdToClipboard";

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/video-feed`;
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
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

  const deleteItem = async (id: string) => {
    setLoading(true);
    await deleteVideoFeed(id);
    fetch();
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
    {
      title: "_id",
      dataIndex: "id",
      width: "3%",
      render: (id) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    {
      title: "Title",
      dataIndex: "title",
      width: "18%",
      render: (value: string, record: FeedItem) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
      ),
      align: "center",
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
      render: (_, record: FeedItem) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
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

  const [fetchedVideos, setFetchedVideos] = useState<any[]>([]);
  const [page, setPage] = useState<number>(0);
  const LIMIT = 20;

  const fetchData = () => {
    const setNewData = () => {
      setFetchedVideos((prev) => [
        ...prev.concat(videos.slice(page * LIMIT, page * LIMIT + LIMIT)),
      ]);
      setPage((prev) => prev + 1);
    };
    if (!videos.length) {
      return;
    }
    if (!fetchedVideos.length) {
      setNewData();
      return;
    }
    setTimeout(setNewData, 1000);
  };

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos]);

  return (
    <div className="video-feed">
      <PageHeader
        title="Video feed update"
        subTitle="List of Feeds"
        extra={[
          <Button
            disabled
            onClick={onRebuildFeedClick}
            danger
            key="1"
            type="primary"
          >
            Publish to Public
          </Button>,
          <Button key="2" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <Content>
        <InfiniteScroll
          dataLength={fetchedVideos.length}
          next={fetchData}
          hasMore={loading || fetchedVideos.length !== videos.length}
          loader={
            !loading && (
              <div className="scroll-message">
                <Spin />
              </div>
            )
          }
          endMessage={
            <div className="scroll-message">
              <b>End of results.</b>
            </div>
          }
        >
          <Table
            size="small"
            columns={columns}
            rowKey="id"
            dataSource={fetchedVideos}
            loading={loading}
            pagination={false}
          />
        </InfiniteScroll>
      </Content>
    </div>
  );
};

export default withRouter(VideoFeed);
