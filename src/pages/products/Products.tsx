import {
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Col, PageHeader, Popconfirm, Row, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import CopyIdToClipboard from "components/CopyIdToClipboard";
import EditableTable, { EditableColumnType } from "components/EditableTable";
import EditMultipleButton from "components/EditMultipleButton";
import { SearchFilterDebounce } from "components/SearchFilterDebounce";
import { SelectBrand } from "components/SelectBrand";
import { AppContext } from "contexts/AppContext";
import useAllCategories from "hooks/useAllCategories";
import { useRequest } from "hooks/useRequest";
import { Brand } from "interfaces/Brand";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link, RouteComponentProps } from "react-router-dom";
import {
  deleteProduct,
  fetchProducts,
  saveProduct,
} from "services/DiscoClubService";
import EditProductModal from "./EditProductModal";
import ProductAPITestModal from "./ProductAPITestModal";
import ProductExpandedRow from "./ProductExpandedRow";

const Products: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/product/commited`;
  const { usePageFilter } = useContext(AppContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [productAPITest, setProductAPITest] = useState<Product | null>(null);

  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();

  const [searchFilter, setSearchFilter] = usePageFilter<string>("search");
  const [brandFilter, setBrandFilter] = usePageFilter<Brand | undefined>(
    "brand"
  );
  const [unclassifiedFilter, setUnclassifiedFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [content, setContent] = useState<any[]>([]);

  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });

  const _fetchProducts = async () => {
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchProducts({
        limit: 30,
        page: pageToUse,
        brandId: brandFilter?.id,
        query: searchFilter,
        unclassified: unclassifiedFilter,
      })
    );
    setPage(pageToUse + 1);
    if (response.results.length < 30) setEof(true);
    return response;
  };

  const getResources = async () => {
    const [{ results }] = await Promise.all([
      _fetchProducts(),
      fetchAllCategories(),
    ]);
    setProducts(results);
    setContent(results);
  };

  const refreshProducts = async () => {
    setSelectedRowKeys([]);
    setPage(0);
    setRefreshing(true);
  };

  const fetchData = async () => {
    if (!products.length) return;
    const { results } = await _fetchProducts();
    setProducts((prev) => [...prev.concat(results)]);
  };

  useEffect(() => {
    const getProducts = async () => {
      const { results } = await _fetchProducts();
      setProducts(results);
      setRefreshing(false);
    };
    if (refreshing) {
      setEof(false);
      getProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  useEffect(() => {
    if (allCategories["Super Category"].length) refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter, brandFilter, unclassifiedFilter]);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (_id: string) => {
    await doRequest(() => deleteProduct(_id));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === _id) {
        const index = i;
        setProducts((prev) => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
  };

  const onSaveCategories = async (record: Product) => {
    await saveCategories(() => saveProduct(record));
    await refreshProducts();
  };

  const onSaveProduct = async (record: Product) => {
    await doRequest(() => saveProduct(record));
    await refreshProducts();
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: "Id",
      dataIndex: "id",
      width: "6%",
      render: (id) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    {
      title: "Name",
      dataIndex: "name",
      width: "22%",
      render: (value: string, record) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
      ),
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "20%",
      align: "center",
      responsive: ["sm"],
    },
    {
      title: "In Stock",
      dataIndex: "outOfStock",
      width: "7%",
      align: "center",
      render: (outOfStock: boolean) => (outOfStock ? "No" : "Yes"),
    },
    {
      title: "Max DD",
      dataIndex: "maxDiscoDollars",
      width: "12%",
      align: "center",
      responsive: ["sm"],
      // editable: true,
      // number: true,
    },
    {
      title: "Disco %",
      dataIndex: "discoPercentage",
      width: "8%",
      align: "center",
      responsive: ["sm"],
      // editable: true,
      // number: true,
    },
    {
      title: "Shopify Id",
      dataIndex: "shopifyUniqueId",
      width: "15%",
      align: "center",
      responsive: ["sm"],
    },

    {
      title: "Expiration Date",
      dataIndex: "offerExpirationDate",
      width: "13%",
      align: "center",
      responsive: ["sm"],
      render: (creationDate: Date) => moment(creationDate).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: ["status"],
      width: "12%",
      align: "center",
      responsive: ["sm"],
    },
    {
      title: "Actions",
      key: "action",
      width: "12%",
      align: "right",
      render: (_: any, record) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EditOutlined />
          </Link>
          {record.brand?.automated !== true && (
            <Popconfirm
              title="Are you sure？"
              okText="Yes"
              cancelText="No"
              onConfirm={() => deleteItem(record.id)}
            >
              <Button
                type="link"
                style={{ padding: 0, margin: "6px 0 6px 6px" }}
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          )}
          <Button
            onClick={() => setProductAPITest(record)}
            type="link"
            style={{ padding: 0, margin: "6px 0 6px 6px" }}
          >
            <SettingOutlined />
          </Button>
        </>
      ),
    },
  ];

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    setBrandFilter(_selectedBrand);
  };

  const handleFilterClassified = (e: CheckboxChangeEvent) => {
    setUnclassifiedFilter(e.target.checked);
  };

  const handleRowSelection = (preSelectedRows: any[]) => {
    const selectedRows: any[] = [];
    preSelectedRows.forEach((productId) => {
      const product = products.find((product) => product.id === productId);
      if (product!.brand?.automated !== true) selectedRows.push(productId);
    });
    setSelectedRowKeys(selectedRows);
  };

  return (
    <>
      <PageHeader
        title="Products"
        subTitle="List of Live Products"
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
            <Col lg={8} xs={16}>
              <SelectBrand
                style={{ width: "100%" }}
                allowClear={true}
                onChange={onChangeBrand}
                initialBrandName={brandFilter?.brandName}
              ></SelectBrand>
            </Col>
            <Col lg={8} xs={16}>
              <Checkbox
                onChange={handleFilterClassified}
                style={{ margin: "42px 0 16px 8px" }}
              >
                Unclassified only
              </Checkbox>
            </Col>
          </Row>
        </Col>
        <EditMultipleButton
          text="Edit Products"
          arrayList={products}
          ModalComponent={EditProductModal}
          selectedRowKeys={selectedRowKeys}
          onOk={refreshProducts}
        />
      </Row>
      <ProductAPITestModal
        selectedRecord={productAPITest}
        setSelectedRecord={setProductAPITest}
      />
      <InfiniteScroll
        dataLength={products.length}
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
        <EditableTable
          rowKey="id"
          columns={columns}
          dataSource={products}
          loading={refreshing || (!products.length && loading)}
          onSave={onSaveProduct}
          pagination={false}
          rowSelection={{
            selectedRowKeys,
            onChange: handleRowSelection,
          }}
          expandable={{
            expandedRowRender: (record: Product) => (
              <ProductExpandedRow
                key={record.id}
                record={record}
                allCategories={allCategories}
                onSaveProduct={onSaveCategories}
                loading={loadingCategories}
              ></ProductExpandedRow>
            ),
          }}
        />
      </InfiniteScroll>
    </>
  );
};

export default Products;
