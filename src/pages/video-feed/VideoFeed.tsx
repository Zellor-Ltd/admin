import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Input,
  Layout,
  message,
  Modal,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tag as AntTag,
  Typography,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import CopyIdToClipboard from "components/CopyIdToClipboard";
import { FeedItem } from "interfaces/FeedItem";
import { Segment } from "interfaces/Segment";
import React, { useEffect, useState } from "react";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import {
  deleteVideoFeed,
  fetchVideoFeed,
  rebuildAllFeedd,
} from "services/DiscoClubService";
import { SelectBrand } from "components/SelectBrand";
import useFilter from "hooks/useFilter";
import { Brand } from "interfaces/Brand";

const { Content } = Layout;

const reduceSegmentsTags = (packages: Segment[]) => {
  return packages.reduce((acc: number, curr: Segment) => {
    return acc + curr.tags?.length;
  }, 0);
};

const VideoFeed: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/video-feed`;
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [content, setContent] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);

  const {
    setArrayList: setFilteredItems,
    filteredArrayList: filteredItems,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<FeedItem>([]);

  const fetch = async (_brand?: Brand) => {
    setLoading(true);
    try {
      const response: any = await fetchVideoFeed();
      setLoading(false);
      setFilteredItems(response.results);
      setContent(response.results);
    } catch (error) {
      message.error("Error to get feed");
      setLoading(false);
    }

    if (_brand) {
      addFilterFunction("brandName", (feedItems) =>
        feedItems.filter((feedItem) => {
          for (let i = 0; i < feedItem.package.length; i++) {
            if (feedItem.package[i].brands) {
              for (let j = 0; j < feedItem.package[i].brands.length; j++) {
                return (
                  feedItem.package[i].brands[j].brandName === _brand.brandName
                );
              }
            } else {
              return null;
            }
          }
        })
      );
    }
  };

  const getResources = (_brand?: Brand) => {
    fetch(_brand);
    setLoaded(true);
  };

  const deleteItem = async (_id: string) => {
    setLoading(true);
    await deleteVideoFeed(_id);
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === _id) {
        const index = i;
        setFilteredItems((prev) => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
    setLoading(false);
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

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (loaded) {
      if (!_selectedBrand) {
        removeFilterFunction("brandName");
        return;
      }
      addFilterFunction("brandName", (feedItems) =>
        feedItems.filter((feedItem) => {
          for (let i = 0; i < feedItem.package.length; i++) {
            if (feedItem.package[i].brands) {
              for (let j = 0; j < feedItem.package[i].brands.length; j++) {
                return (
                  feedItem.package[i].brands[j].brandName ===
                  _selectedBrand.brandName
                );
              }
            } else {
              return null;
            }
          }
        })
      );
    } else {
      if (_selectedBrand) {
        getResources(_selectedBrand);
      } else {
        getResources();
      }
    }
  };

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterFeed = () => {
    return filteredItems.filter((item) =>
      item.title?.toUpperCase().includes(filterText.toUpperCase())
    );
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
      title: "Status",
      dataIndex: "status",
      width: "12%",
      align: "center",
      responsive: ["sm"],
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

  return (
    <div className="video-feed">
      <PageHeader
        title="Video feed update"
        subTitle="List of Feeds"
        extra={[
          <Button key="2" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <div style={{ marginBottom: "16px" }}>
        <Row align="bottom" justify="space-between">
          <Col lg={16} xs={24}>
            <Row gutter={8}>
              <Col lg={8} xs={16}>
                <Typography.Title level={5} title="Search">
                  Search
                </Typography.Title>
                <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
              </Col>
              <Col lg={8} xs={16}>
                <SelectBrand
                  style={{ width: "100%" }}
                  allowClear={true}
                  onChange={onChangeBrand}
                ></SelectBrand>
              </Col>
            </Row>
          </Col>
          <Col>
            <Button
              type="primary"
              onClick={() => getResources()}
              loading={loading}
              style={{
                marginRight: "25px",
              }}
            >
              Search
              <SearchOutlined style={{ color: "white" }} />
            </Button>
          </Col>
        </Row>
      </div>
      <Content>
        <Table
          size="small"
          columns={columns}
          rowKey="id"
          dataSource={filterFeed()}
          loading={loading}
        />
      </Content>
    </div>
  );
};

export default withRouter(VideoFeed);
