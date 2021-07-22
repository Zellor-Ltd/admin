import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Button, Col, PageHeader, Popconfirm, Row } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import EditableTable, { EditableColumnType } from "components/EditableTable";
import { SearchFilter } from "components/SearchFilter";
import { SelectBrand } from "components/SelectBrand";
import useAllCategories from "hooks/useAllCategories";
import useFilter from "hooks/useFilter";
import { useRequest } from "hooks/useRequest";
import { Brand } from "interfaces/Brand";
import { Product } from "interfaces/Product";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link } from "react-router-dom";
import {
  deleteStagingProduct,
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from "services/DiscoClubService";
import ProductExpandedRow from "./ProductExpandedRow";

const StagingList: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
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

  const getResources = useCallback(async () => {
    const [products] = await Promise.all([
      doFetch(fetchStagingProducts),
      fetchAllCategories(),
    ]);
    setProducts(products);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getProducts = async () => {
    const products = await doFetch(fetchStagingProducts);
    setProducts(products);
  };

  useEffect(() => {
    getResources();
  }, [getResources]);

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteStagingProduct(id));
    await getProducts();
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
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: "Name",
      dataIndex: "name",
      width: "25.5%",
      render: (value: string, record: Product) => (
        <Link to={{ pathname: `/product/staging`, state: record }}>
          {value}
        </Link>
      ),
    },
    {
      title: "Brand",
      dataIndex: ["brand", "brandName"],
      width: "18%",
      align: "center",
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
      title: "First Import",
      dataIndex: "hCreationDate",
      width: "12.5%",
      align: "center",
      render: (hCreationDate: Date | null | undefined) =>
        hCreationDate ? (
          <>
            <div>
              {moment(hCreationDate).format("DD/MM/YY")}{" "}
              {moment(hCreationDate).format("HH:mm")}
            </div>
          </>
        ) : (
          ""
        ),
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
          <Link to={{ pathname: `/product/staging`, state: record }}>
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction("productName", (products) =>
      products.filter((product) =>
        product.name?.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction("brandName");
      return;
    }
    addFilterFunction("brandName", (products) =>
      products.filter(
        (product) => product.brand.brandName === _selectedBrand.brandName
      )
    );
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
      <PageHeader title="Staging" subTitle="List of Staging Products" />
      <Row gutter={8}>
        <Col xxl={40} lg={6} xs={18}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by Name"
          />
        </Col>
        <Col xxl={40} lg={6} xs={18}>
          <SelectBrand
            style={{ width: "100%" }}
            allowClear={true}
            onChange={onChangeBrand}
          ></SelectBrand>
        </Col>
        <Col lg={8} xs={16}>
        </Col>
      </Row>
      <EditableTable
        rowKey="id"
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        onSave={onSaveProduct}
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
