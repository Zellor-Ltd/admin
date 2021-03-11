import { Button, PageHeader, Popconfirm, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Tag } from "interfaces/Tag";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { fetchTags, fetchVideoFeed } from "services/DiscoClubService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const deleteItem = (id: string | undefined) => {
  // deleteVideoFeed(id);
};

const columns: ColumnsType<Tag> = [
  { title: "Name", dataIndex: "name", width: "15%" },
  { title: "Brand Name", dataIndex: "brandName", width: "70%" },
  {
    title: "actions",
    key: "action",
    width: "5%",
    align: "right",
    render: (value, record) => (
      <>
        <Link to={{ pathname: `/tag/${record.tagId}`, state: record }}>
          <EditOutlined />
        </Link>
        <Popconfirm title="Are you sure？" okText="Yes" cancelText="No">
          <Button type="link" style={{ padding: 0, margin: 6 }}>
            <DeleteOutlined onClick={() => deleteItem(record.tagId)} />
          </Button>
        </Popconfirm>
      </>
    ),
  },
];

const Tags: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>();

  useEffect(() => {
    let mounted = true;
    const fetchVideos = async () => {
      setLoading(true);
      const temp: any = await fetchVideoFeed();

      const response: any = await fetchTags();
      if (mounted) {
        setLoading(false);
        const ta = temp.results.reduce((prev: Tag[], curr: any) => {
          if (curr.tags) {
            prev.push(...curr.tags);
          }
          return prev;
        }, []);
        setTags(ta);
        console.log(response);
        // setTags(response.results);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div className="products">
      <PageHeader
        title="Products"
        subTitle="List of Products"
        extra={[
          <Button key="1" onClick={() => history.push("/tag/0")}>
            New Item
          </Button>,
        ]}
      />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={tags}
        loading={loading}
      />
    </div>
  );
};

export default Tags;
