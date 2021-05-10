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
import {
  deleteVideoFeed,
  fetchVideoFeed,
  rebuildAllFeedd,
  saveVideoFeed,
} from "services/DiscoClubService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import { EditableCell, EditableRow } from "components";
import { ColumnTypes } from "components/editable-context";

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

  useEffect(() => {
    fetch();
  }, []);

  const deleteItem = async (id: string) => {
    setLoading(true);
    await deleteVideoFeed({ id });
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
  const columns = [
    { title: "Title", dataIndex: "title", width: "15%", editable: true },
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
      render: (value: any, record: FeedItem) => (
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

  const onSaveFeed = async (record: FeedItem) => {
    setLoading(true);
    await saveVideoFeed(record);
    fetch();
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const configuredColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: FeedItem, index: number) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        onSave: onSaveFeed,
      }),
    };
  });

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
          components={components}
          columns={configuredColumns as ColumnTypes}
          rowKey="id"
          dataSource={videos}
          loading={loading}
        />
      </Content>
    </div>
  );
};

export default withRouter(VideoFeed);
