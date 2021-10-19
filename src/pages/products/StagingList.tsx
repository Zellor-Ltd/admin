import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Col, PageHeader, Popconfirm, Row } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import EditableTable, { EditableColumnType } from "components/EditableTable";
import EditMultipleButton from "components/EditMultipleButton";
import { SearchFilter } from "components/SearchFilter";
import { SelectBrand } from "components/SelectBrand";
import useAllCategories from "hooks/useAllCategories";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { Brand } from "interfaces/Brand";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import {
  deleteStagingProduct,
  fetchProducts,
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from "services/DiscoClubService";
import EditProductModal from "./EditProductModal";
import ProductExpandedRow from "./ProductExpandedRow";
import CopyIdToClipboard from "components/CopyIdToClipboard";
import Products from "./Products";

const StagingList: React.FC<RouteComponentProps> = ({ location }) => {
  const detailsPathname = `${location.pathname}/product/staging`;
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [content, setContent] = useState<any>();
  const [preLoaded, setPreLoaded] = useState<boolean>(false);

  const {
    setArrayList: setProducts,
    filteredArrayList: filteredProducts,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Product>([]);

  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });

  const getResources = useCallback(async (_brand?, _text?) => {
    const [{ results }] = await Promise.all([
      doFetch(fetchStagingProducts),
      fetchAllCategories(),
    ]);
    setPreLoaded(true);
    if (_brand || _text) {
      if (_brand) {
        setProducts(
          results.filter(
            (product) => product.brand.brandName === _brand.brandName
          )
        );
      } else if (_text) {
        setProducts(
          results.filter((product) =>
            product.name?.toUpperCase().includes(_text.toUpperCase())
          )
        );
      }
    } else {
      setProducts(results);
      setContent(results);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProducts = async () => {
    const { results } = await doFetch(fetchStagingProducts);
    setProducts(results);
  };

  const deleteItem = async (_id: string) => {
    await doRequest(() => deleteStagingProduct(_id));
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
    await saveCategories(() => saveStagingProduct(record));
    await getProducts();
  };

  const onSaveProduct = async (record: Product) => {
    await doRequest(() => saveStagingProduct(record));
    await getProducts();
  };

  const handleStage = async (productId: string) => {
    await doRequest(() => transferStageProduct(productId), "Product commited.");
    await getProducts();
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
      width: "25.5%",
      render: (value: string, record: Product) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
      ),
    },
    {
      title: "Master Brand",
      dataIndex: ["brand", "brandName"],
      width: "18%",
      align: "center",
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
      width: "7%",
      align: "center",
      editable: true,
      number: true,
    },
    {
      title: "Last Import",
      dataIndex: "lastImportDate",
      width: "12.5%",
      align: "center",
      render: (lastImportDate: Date | null | undefined) =>
        lastImportDate ? (
          <>
            <div>
              {moment(lastImportDate).format("DD/MM/YY")}{" "}
              {moment(lastImportDate).format("HH:mm")}
            </div>
          </>
        ) : (
          ""
        ),
    },
    {
      title: "Last Go-Live",
      dataIndex: "lastGoLiveDate",
      width: "12.5%",
      align: "center",
      render: (lastGoLiveDate: Date | null | undefined) =>
        lastGoLiveDate ? (
          <>
            <div>
              {moment(lastGoLiveDate).format("DD/MM/YY")}{" "}
              {moment(lastGoLiveDate).format("HH:mm")}
            </div>
          </>
        ) : (
          ""
        ),
    },
    {
      title: "Actions",
      key: "action",
      width: "12%",
      align: "right",
      render: (_, record: Product) => (
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
            <Button
              type="link"
              style={{ padding: 0, marginLeft: 8 }}
              disabled={record.lastGoLiveDate != null}
            >
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

  const searchFilterFunction = (_filterText: string) => {
    if (preLoaded) {
      addFilterFunction("productName", (products) =>
        products.filter((product) =>
          product.name?.toUpperCase().includes(_filterText.toUpperCase())
        )
      );
    } else {
      getResources(_filterText);
    }
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (preLoaded) {
      if (!_selectedBrand) {
        removeFilterFunction("brandName");
        return;
      }
      addFilterFunction("brandName", (products) =>
        products.filter(
          (product) => product.brand.brandName === _selectedBrand.brandName
        )
      );
    } else {
      if (_selectedBrand) {
        getResources(_selectedBrand);
      } else {
        getResources();
      }
    }
  };

  const handleEditProducts = async () => {
    await fetchProducts({});
    setSelectedRowKeys([]);
  };

  const handleFilterClassified = (e: CheckboxChangeEvent) => {
    if (!e.target.checked) {
      removeFilterFunction("categorized");
      return;
    }
    addFilterFunction("categorized", (products) =>
      products.filter((product) => !product.categories?.length)
    );
  };

  return (
    <>
      <PageHeader
        title="Preview Products"
        subTitle="List of Products in Preview Mode (not live)"
      />
      <Row align="bottom" justify="space-between">
        <Col lg={16} xs={24}>
          <Row gutter={8}>
            <Col lg={8} xs={24}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by Product"
              />
            </Col>
            <Col lg={8} xs={24}>
              <SelectBrand
                style={{ width: "100%" }}
                allowClear={true}
                onChange={onChangeBrand}
              ></SelectBrand>
            </Col>
            <Col lg={8} xs={24}>
              <Checkbox
                onChange={handleFilterClassified}
                style={{ margin: "42px 0 16px 8px" }}
              >
                Unclassified only
              </Checkbox>
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
            }}
          >
            Search
            <SearchOutlined style={{ color: "white" }} />
          </Button>
        </Col>
        <EditMultipleButton
          text="Edit Products"
          arrayList={filteredProducts}
          ModalComponent={EditProductModal}
          selectedRowKeys={selectedRowKeys}
          onOk={handleEditProducts}
        />
      </Row>
      <EditableTable
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        onSave={onSaveProduct}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
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
    </>
  );
};

export default StagingList;
