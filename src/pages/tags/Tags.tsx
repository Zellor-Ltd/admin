import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { SearchFilter } from "components/SearchFilter";
import useFilter from "hooks/useFilter";
import { Tag } from "interfaces/Tag";
import { useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { deleteTag, fetchTags } from "services/DiscoClubService";

const Tags: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/tag`;
  const [loading, setLoading] = useState<boolean>(false);

  const {
    setArrayList: setTags,
    filteredArrayList: filteredTags,
    addFilterFunction,
  } = useFilter<Tag>([]);

  const fetchVideos = async () => {
    setLoading(true);
    const response: any = await fetchTags();
    setLoading(false);
    setTags(response.results);
  };

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    { title: "Template", dataIndex: "template", width: "15%" },
    { title: "DD's", dataIndex: "discoDollars", width: "5%" },
    {
      title: "Actions",
      key: "action",
      width: "5%",
      align: "right",
      render: (value, record) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EyeOutlined />
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("tagName", (tags) =>
      tags.filter((tag) =>
        tag.tagName.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div className="tags">
      <PageHeader
        title="Tags"
        subTitle="List of Tags"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <Row gutter={8}>
        <Col lg={8} xs={16}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by Name"
          />
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTags}
        loading={loading}
      />
    </div>
  );
};

export default Tags;
