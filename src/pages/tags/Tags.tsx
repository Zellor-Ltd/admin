import { DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row, Spin, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import CopyIdToClipboard from "components/CopyIdToClipboard";
import { SearchFilterDebounce } from "components/SearchFilterDebounce";
import { AppContext } from "contexts/AppContext";
import { useRequest } from "hooks/useRequest";
import { Tag } from "interfaces/Tag";
import { useContext, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link, RouteComponentProps } from "react-router-dom";
import { deleteTag, fetchTags } from "services/DiscoClubService";

const Tags: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/tag`;

  const { usePageFilter } = useContext(AppContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const { doFetch, doRequest } = useRequest({ setLoading });

  const [searchFilter, setSearchFilter] = usePageFilter<string>("search");
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [content, setContent] = useState<any[]>([]);

  const [tags, setTags] = useState<Tag[]>([]);

  const _fetchTags = async () => {
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchTags({
        limit: 30,
        page: pageToUse,
        query: searchFilter,
      })
    );
    setPage(pageToUse + 1);
    if (response.results.length < 30) setEof(true);
    return response;
  };

  const getResources = async () => {
    const [{ results }] = await Promise.all([_fetchTags()]);
    setTags(results);
  };

  const refreshTags = async () => {
    setPage(0);
    setRefreshing(true);
  };

  const fetchData = async () => {
    if (!tags.length) return;
    const { results } = await _fetchTags();
    setTags((prev) => [...prev.concat(results)]);
  };

  useEffect(() => {
    const getTags = async () => {
      const { results } = await _fetchTags();
      setTags(results);
      setContent(results);
      setRefreshing(false);
    };
    if (refreshing) {
      setEof(false);
      getTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  useEffect(() => {
    if (tags.length) refreshTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter]);

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteTag({ id }));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === id) {
        const index = i;
        setTags((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
      }
    }
  };

  const columns: ColumnsType<Tag> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "6%",
      render: (id) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    { title: "Tag", dataIndex: "tagName", width: "15%" },
    {
      title: "Product",
      dataIndex: ["product", "name"],
      width: "20%",
    },
<<<<<<< HEAD
    { title: "Store", dataIndex: ["brand", "brandName"], width: "20%" },
=======
    { title: "Master Brand", dataIndex: ["brand", "brandName"], width: "20%" },
>>>>>>> master
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

  return (
    <>
      <PageHeader
        title="Tags"
        subTitle="List of Tags"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <Row align="bottom" justify="space-between">
        <Col lg={16} xs={24}>
          <Row gutter={8}>
            <Col lg={8} xs={16}>
              <SearchFilterDebounce
                initialValue={searchFilter}
                filterFunction={setSearchFilter}
                label="Search by Name"
              />
            </Col>
          </Row>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => getResources()}
            loading={loading}
            style={{
              marginBottom: "20px",
              marginRight: "25px",
            }}
          >
            Search
            <SearchOutlined style={{ color: "white" }} />
          </Button>
        </Col>
      </Row>
      <InfiniteScroll
        dataLength={tags.length}
        next={fetchData}
        hasMore={!eof}
        loader={
          page !== 0 && (
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
          rowKey="id"
          columns={columns}
          dataSource={tags}
          loading={refreshing || (!tags.length && loading)}
          pagination={false}
        />
      </InfiniteScroll>
    </>
  );
};

export default Tags;
