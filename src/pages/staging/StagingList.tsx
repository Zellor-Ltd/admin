import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Input,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tag,
  Typography,
} from "antd";
import { ColumnsType } from "antd/lib/table";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deleteStagingProduct,
  fetchStagingProducts,
  transferStageProduct,
} from "services/DiscoClubService";
import "./StagingList.scss";

const StagingList: React.FC<RouteComponentProps> = ({ history }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filterText, setFilterText] = useState("");

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchStagingProducts();
    setLoading(false);
    setProducts(response.results);
  };

  useEffect(() => {
    fetch();
  }, []);

  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      await deleteStagingProduct(id);
      await fetch();
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterProduct = () => {
    return products.filter((product) =>
      product.name?.toUpperCase().includes(filterText.toUpperCase())
    );
  };

  const handleStage = async (productId: string) => {
    try {
      await transferStageProduct(productId);
      fetch();
      message.success("Product sent to stage");
    } catch (err) {
      message.success("Error at staging product");
    }
  };

  const columns: ColumnsType<Product> = [
    {
      title: "Name",
      dataIndex: "name",
      width: "15%",
      render: (value: string, record: Product) => (
        <Link to={{ pathname: `/staging-product`, state: record }}>
          {value}
        </Link>
      ),
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "15%",
      align: "center",
    },
    {
      title: "Related Videos",
      dataIndex: "relatedVideoFeed",
      width: "15%",
      align: "center",
      render: (videos = []) => <Tag>{videos.length}</Tag>,
    },
    {
      title: "Expiration Date",
      dataIndex: "offerExpirationDate",
      width: "15%",
      align: "center",
      render: (creationDate: Date) => moment(creationDate).format("DD/MM/YYYY"),
    },
    {
      title: "Last Import",
      dataIndex: "lastImportDate",
      width: "15%",
      align: "center",
      render: (lastImportDate: Date | null | undefined) =>
        lastImportDate ? (
          <>
            <div>{moment(lastImportDate).format("DD/MM/YYYY")}</div>
            <div>{moment(lastImportDate).format("HH:mm")}</div>
          </>
        ) : (
          ""
        ),
    },
    {
      title: "actions",
      key: "action",
      width: "12%",
      align: "right",
      render: (_, record: Product) => (
        <>
          <Link to={{ pathname: `/staging-product`, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, marginLeft: 8 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
          <Button
            onClick={() => handleStage(record.id)}
            type="link"
            style={{ color: "green", padding: 0, margin: 6 }}
          >
            <ArrowRightOutlined />
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="products">
      <PageHeader title="Staging" subTitle="List of Products to Stage" />
      <div className="filter">
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={5} title="Search">
              Search
            </Typography.Title>
            <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
          </Col>
        </Row>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filterProduct()}
        loading={loading}
      />
    </div>
  );
};

export default StagingList;
