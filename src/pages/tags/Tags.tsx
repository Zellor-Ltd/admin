import { Button, PageHeader, Popconfirm, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { Tag } from "interfaces/Tag";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import { deleteTag, fetchTags } from "services/DiscoClubService";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const Tags: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [tags, setTags] = useState<Tag[]>();

  const fetchVideos = async () => {
    setLoading(true);
    const response: any = await fetchTags();
    setLoading(false);
    setTags(response.results);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await deleteTag({ id });
      fetchVideos();
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const columns: ColumnsType<Tag> = [
    { title: "Tag", dataIndex: "tagName", width: "15%" },
    {
      title: "Product",
      dataIndex: ["product", "name"],
      width: "20%",
    },
    { title: "Brand", dataIndex: ["brand", "brandName"], width: "20%" },
    { title: "Template", dataIndex: "template", width: "20%" },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <>
          <Link to={{ pathname: `/tag`, state: record }}>
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
    <div className="tags">
      <PageHeader
        title="Tags"
        subTitle="List of Tags"
        extra={[
          <Button key="1" onClick={() => history.push("/tag")}>
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
