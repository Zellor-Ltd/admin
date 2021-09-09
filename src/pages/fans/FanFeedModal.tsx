import {
  Modal, Table,
  Tag as AntTag
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { useRequest } from "hooks/useRequest";
import { Fan } from "interfaces/Fan";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import React, { useEffect, useState } from "react";
import {
  fetchUserFeed
} from "services/DiscoClubService";

interface FanFeedModalProps {
  selectedRecord: Fan | null;
  setSelectedRecord: React.Dispatch<React.SetStateAction<Fan | null>>;
}

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const FanFeedModal: React.FC<FanFeedModalProps> = (props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userFeed, setUserFeed] = useState<any[]>([]);

  const getResources = async () => {
    await fetchUserFeed(props.selectedRecord!.id);
  };

  useEffect(() => {
    if (props.selectedRecord !== null) {
      getResources()
    }
  }, []);

  
  const _onOk = () => {
    props.setSelectedRecord(null);
  };

  const onCancel = () => {
    props.setSelectedRecord(null);    
  };

  const columns: ColumnsType<FeedItem> = [
    {
      title: "Title",
      dataIndex: "title",
      width: "15%",
      // render: (value: string, record: FeedItem) => (
      //   <Link to={{ pathname: `/video-feed`, state: record }}>{value}</Link>
      // ),
      align: "center"
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
  ];

  return (
    <Modal
      title="Video Feed"
      visible={!!props.selectedRecord}
      footer={null}
      width="300px"
      okButtonProps={{ loading: loading }}
      forceRender>
      <div className="feed-mixer">
          <Table
            rowKey="id"
            columns={columns}
            dataSource={userFeed}
            loading={loading}
          />
      </div>
    </Modal>
  );
};

export default FanFeedModal;
