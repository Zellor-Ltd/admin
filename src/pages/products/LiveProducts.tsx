import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Form,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Typography,
} from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import './Products.scss';
import EditMultipleButton from 'components/EditMultipleButton';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import EditableTable, { EditableColumnType } from 'components/EditableTable';
import { SearchFilterDebounce } from 'components/SearchFilterDebounce';
import { AppContext } from 'contexts/AppContext';
import useAllCategories from 'hooks/useAllCategories';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Product } from 'interfaces/Product';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  deleteProduct,
  fetchBrands,
  fetchProductBrands,
  fetchProducts,
  saveProduct,
} from 'services/DiscoClubService';
import EditProductModal from './EditProductModal';
import ProductAPITestModal from './ProductAPITestModal';
import ProductExpandedRow from './ProductExpandedRow';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ProductBrand } from 'interfaces/ProductBrand';
import { productUtils } from '../../helpers/product-utils';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import ProductsDetails from './ProductsDetails';

const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  productUtils;

const LiveProducts: React.FC<RouteComponentProps> = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrand, setIsFetchingProductBrand] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading,
  });
  const { usePageFilter } = useContext(AppContext);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [productAPITest, setProductAPITest] = useState<Product | null>(null);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [brandFilter, setBrandFilter] = useState<Brand | undefined>();
  const [productBrandFilter, setProductBrandFilter] = useState<
    ProductBrand | undefined
  >();
  const [outOfStockFilter, setOutOfStockFilter] = useState<boolean>(false);
  const [currentMasterBrand, setCurrentMasterBrand] = useState<string>();
  const [currentProductBrand, setCurrentProductBrand] = useState<string>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const handleFilterOutOfStock = (e: CheckboxChangeEvent) => {
    setOutOfStockFilter(e.target.checked);
  };

  useMount(async () => {
    const getBrands = async () => {
      setLoading(true);
      setIsFetchingBrands(true);
      const response: any = await fetchBrands();
      setLoading(false);
      setIsFetchingBrands(false);
      setBrands(response.results);
    };

    const getProductBrands = async () => {
      setIsFetchingProductBrand(true);
      const { results }: any = await fetchProductBrands();
      setProductBrands(results);
      setIsFetchingProductBrand(false);
    };

    await Promise.all([getBrands(), getProductBrands(), fetchAllCategories()]);
  });

  useEffect(() => {
    form.setFieldsValue(currentProduct);
  }, [currentProduct]);

  const setDiscoPercentageByBrand = useCallback(
    (useInitialValue: boolean) => {
      const product = form.getFieldsValue(true);
      const selectedBrand = brands?.find(
        (brand: Brand) => brand.id === product.brand?.id
      );

      let discoPercentage;

      if (useInitialValue && currentProduct) {
        discoPercentage =
          currentProduct.discoPercentage || selectedBrand?.discoPercentage;
      } else {
        discoPercentage = selectedBrand?.discoPercentage;
      }

      form.setFieldsValue({
        discoPercentage,
      });
    },
    [brands, form, currentProduct]
  );

  const handleMasterBrandChange = (filterMasterBrand: Function) => {
    filterMasterBrand(form);
  };

  const handleProductBrandChange = (filterProductBrand: Function) => {
    filterProductBrand(form);
  };

  const setSearchTagsByCategory = useCallback(
    (
      useInitialValue: boolean,
      selectedCategories: any[] = [],
      categoryKey?: string,
      productCategoryIndex?: number
    ) => {
      const currentCategories = getCategories(form, allCategories);
      let previousTags: string[] = [];

      if (
        productCategoryIndex !== undefined &&
        categoryKey !== undefined &&
        currentProduct &&
        currentProduct?.categories
      ) {
        previousTags = getSearchTags(
          currentProduct.categories[productCategoryIndex],
          categoryKey
        );
      }

      const selectedCategoriesSearchTags = selectedCategories
        .filter(v => v && v.searchTags)
        .map(v => v.searchTags)
        .reduce((prev, curr) => {
          return prev?.concat(curr || []);
        }, []);

      let searchTags = form.getFieldValue('searchTags') || [];
      const finalValue = Array.from(
        new Set([
          ...searchTags.filter(tag => previousTags.indexOf(tag) === -1),
          ...selectedCategoriesSearchTags,
        ])
      );
      if (useInitialValue && currentProduct) {
        searchTags = currentProduct.searchTags || finalValue;
      } else {
        searchTags = finalValue;
      }

      if (
        !!selectedCategories &&
        !!currentProduct &&
        !!currentProduct.categories &&
        productCategoryIndex !== undefined
      ) {
        currentProduct.categories[productCategoryIndex] = currentCategories;
      }

      form.setFieldsValue({
        searchTags,
      });
    },
    [form, currentProduct]
  );

  useEffect(() => {
    setDiscoPercentageByBrand(true);
    setSearchTagsByCategory(true);
  }, [brands, setDiscoPercentageByBrand, setSearchTagsByCategory]);

  useEffect(() => {
    if (currentProduct?.ageMin && currentProduct?.ageMax)
      setAgeRange([currentProduct?.ageMin, currentProduct?.ageMax]);
  }, [currentProduct]);

  const _fetchProducts = async searchButton => {
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchProducts({
        limit: 30,
        page: pageToUse,
        brandId: brandFilter?.id,
        query: searchFilter,
        unclassified: false,
        productBrandId: productBrandFilter?.id,
        outOfStock: outOfStockFilter,
      })
    );
    if (searchButton) {
      setPage(0);
    } else {
      setPage(pageToUse + 1);
    }
    if (response.results.length < 30) setEof(true);
    return response;
  };

  const getResources = async triggerByButton => {
    const { results: products } = await _fetchProducts(triggerByButton);

    setProducts(products);
    setLoaded(true);
  };

  const refreshProducts = async () => {
    setSelectedRowKeys([]);
    setPage(0);
    setRefreshing(true);
  };

  const fetchData = async () => {
    if (!products.length) return;
    const { results } = await _fetchProducts(false);
    setProducts(prev => [...prev.concat(results)]);
  };

  useEffect(() => form.resetFields(), [currentProduct]);

  useEffect(() => {
    const getProducts = async () => {
      const { results } = await _fetchProducts(true);
      setProducts(results);
      setRefreshing(false);
    };
    if (refreshing) {
      setEof(false);
      getProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  const deleteItem = async (_id: string, index: number) => {
    await doRequest(() => deleteProduct(_id));
    setProducts(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const onSaveOnRowEdition = async (record: Product) => {
    setCurrentProduct(record);
    await saveCategories(() => saveProduct(record));
    refreshItem(record);
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '17%',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.name != nextRecord.name,
      render: (value: string, record, index) => (
        <>
          <Link
            onClick={() => editProduct(index, record)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            {value}
          </Link>
          <span style={{ fontSize: '12px' }}>
            <br />
            {record.categories
              ? [
                  record.categories[0].superCategory?.superCategory +
                    ' / ' +
                    record.categories[0].category?.category +
                    (record.categories[0].subCategory
                      ? ' / ' + record.categories[0].subCategory?.subCategory
                      : ''),
                  record.categories[0].subSubCategory
                    ? ' / ' +
                      record.categories[0].subSubCategory?.subSubCategory
                    : '',
                  record.categories[1] ? ' (...)' : '',
                ]
              : ''}
          </span>
        </>
      ),
    },
    {
      title: 'Master Brand',
      dataIndex: ['brand', 'brandName'],
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.brand != nextRecord.brand,
    },
    {
      title: 'In Stock',
      dataIndex: 'outOfStock',
      width: '7%',
      align: 'center',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.outOfStock != nextRecord.outOfStock,
      render: (outOfStock: boolean) => (outOfStock ? 'No' : 'Yes'),
    },
    {
      title: 'Max DD',
      dataIndex: 'maxDiscoDollars',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.maxDiscoDollars != nextRecord.maxDiscoDollars,
      // editable: true,
      // number: true,
    },
    {
      title: 'Disco %',
      dataIndex: 'discoPercentage',
      width: '8%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.discoPercentage != nextRecord.discoPercentage,

      // editable: true,
      // number: true,
    },
    {
      title: 'Shopify Id',
      dataIndex: 'shopifyUniqueId',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
    },

    {
      title: 'Expiration Date',
      dataIndex: 'offerExpirationDate',
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.offerExpirationDate != nextRecord.offerExpirationDate,

      render: (creationDate: Date) => moment(creationDate).format('DD/MM/YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '12%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.status != nextRecord.status,
    },
    {
      title: 'Product Brand',
      dataIndex: 'productBrand',
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.productBrand != nextRecord.productBrand,
      render: (field, record) =>
        typeof record.productBrand === 'string'
          ? field
          : record.productBrand?.brandName,
    },
    {
      title: 'Last Go-Live',
      dataIndex: 'goLiveDate',
      width: '10%',
      align: 'center',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.goLiveDate != nextRecord.goLiveDate,

      render: (goLiveDate: Date | null | undefined) =>
        goLiveDate ? (
          <>
            <div>
              {moment(goLiveDate).format('DD/MM/YY')}{' '}
              {moment(goLiveDate).format('HH:mm')}
            </div>
          </>
        ) : (
          ''
        ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '12%',
      align: 'right',
      render: (_: any, record, index) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => editProduct(index, record)}
          >
            <EditOutlined />
          </Link>
          {record.brand?.automated !== true && (
            <Popconfirm
              title="Are you sure？"
              okText="Yes"
              cancelText="No"
              onConfirm={() => deleteItem(record.id, index)}
            >
              <Button
                type="link"
                style={{ padding: 0, margin: '6px 0 6px 6px' }}
              >
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          )}
          <Button
            onClick={() => setProductAPITest(record)}
            type="link"
            style={{ padding: 0, margin: '6px 0 6px 6px' }}
          >
            <SettingOutlined />
          </Button>
        </>
      ),
    },
  ];

  const onSaveItem = async (record: Product) => {
    await doRequest(() => saveProduct(record));
    refreshItem(record);
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    setBrandFilter(_selectedBrand);
  };

  const onChangeProductBrand = async (
    _selectedBrand: ProductBrand | undefined
  ) => {
    setProductBrandFilter(_selectedBrand);
  };

  const handleRowSelection = (preSelectedRows: any[]) => {
    const selectedRows: any[] = [];
    preSelectedRows.forEach(productId => {
      const product = products.find(product => product.id === productId);
      if (product!.brand?.automated !== true) selectedRows.push(productId);
    });
    setSelectedRowKeys(selectedRows);
  };

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editProduct = (index: number, record?: Product) => {
    setCurrentProduct(record);
    setLastViewedIndex(index);
    if (record) {
      setCurrentMasterBrand(record.brand.brandName);
      if (record.productBrand) {
        if (typeof record.productBrand === 'string') {
          setCurrentProductBrand(record.productBrand);
        } else {
          setCurrentProductBrand(record.productBrand.brandName);
        }
      }
    } else {
      setCurrentMasterBrand(record);
      setCurrentProductBrand(record);
    }
    setDetails(true);
  };

  const refreshItem = (record: Product) => {
    if (loaded) {
      products[lastViewedIndex] = record;
      setProducts([...products]);
    } else {
      setProducts([record]);
    }
  };

  const onSaveProduct = (record: Product) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelProduct = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <>
          <PageHeader
            title="Products"
            subTitle="List of Live Products"
            extra={[
              <Button key="1" onClick={() => editProduct(products.length)}>
                New Item
              </Button>,
            ]}
          />
          <Row align="bottom" justify="space-between">
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={6} xs={16}>
                  <SearchFilterDebounce
                    initialValue={searchFilter}
                    filterFunction={setSearchFilter}
                    label="Search by Name"
                  />
                </Col>
                <Col lg={6} xs={16}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <SimpleSelect
                    data={brands}
                    onChange={(_, brand) => onChangeBrand(brand)}
                    style={{ width: '100%' }}
                    selectedOption={brandFilter?.brandName}
                    optionsMapping={optionsMapping}
                    placeholder={'Select a master brand'}
                    loading={isFetchingBrands}
                    disabled={isFetchingBrands}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
                <Col lg={6} xs={16}>
                  <Typography.Title level={5}>Product Brand</Typography.Title>
                  <SimpleSelect
                    data={productBrands}
                    onChange={(_, productBrand) =>
                      onChangeProductBrand(productBrand)
                    }
                    style={{ width: '100%' }}
                    selectedOption={productBrandFilter?.brandName}
                    optionsMapping={optionsMapping}
                    placeholder={'Select a Product Brand'}
                    loading={isFetchingProductBrand}
                    disabled={isFetchingProductBrand}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
                <Col lg={6} xs={24}>
                  <Checkbox
                    onChange={handleFilterOutOfStock}
                    style={{ margin: '42px 0 16px 8px' }}
                  >
                    Out of Stock only
                  </Checkbox>
                </Col>
              </Row>
            </Col>
            <Col>
              <Row justify="end">
                <Button
                  type="primary"
                  onClick={() => getResources(true)}
                  loading={loading}
                  style={{
                    position: 'relative',
                    bottom: '-49px',
                  }}
                >
                  Search
                  <SearchOutlined style={{ color: 'white' }} />
                </Button>
                <div
                  style={{
                    position: 'relative',
                    bottom: '-49px',
                    marginLeft: '8px',
                  }}
                >
                  <EditMultipleButton
                    text="Edit Products"
                    arrayList={products}
                    ModalComponent={EditProductModal}
                    selectedRowKeys={selectedRowKeys}
                    onOk={refreshProducts}
                  />
                </div>
              </Row>
            </Col>
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
              rowClassName={(_, index) =>
                `scrollable-row-${index} ${
                  index === lastViewedIndex ? 'selected-row' : ''
                }`
              }
              rowKey="id"
              columns={columns}
              dataSource={products}
              loading={refreshing || (!products.length && loading)}
              onSave={onSaveItem}
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
                    onSaveProduct={onSaveOnRowEdition}
                    loading={loadingCategories}
                    isStaging={false}
                    productBrands={productBrands}
                  ></ProductExpandedRow>
                ),
              }}
            />
          </InfiniteScroll>
        </>
      )}
      {details && (
        <ProductsDetails
          brands={brands}
          productBrands={productBrands}
          allCategories={allCategories}
          onSave={onSaveProduct}
          onCancel={onCancelProduct}
          product={currentProduct}
          setCurrentProduct={setCurrentProduct}
          productBrand={currentProductBrand}
          brand={currentMasterBrand}
          isFetchingBrands={isFetchingBrands}
          isFetchingProductBrand={isFetchingProductBrand}
        />
      )}
    </>
  );
};

export default LiveProducts;
