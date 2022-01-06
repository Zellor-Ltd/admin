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
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Popconfirm,
  Radio,
  Row,
  Select,
  Slider,
  Spin,
  Switch,
  Tabs,
  Typography,
} from 'antd';
import { Upload } from 'components';
import { RichTextEditor } from 'components/RichTextEditor';
import { formatMoment } from 'helpers/formatMoment';
import { categoriesSettings } from 'helpers/utils';
import { AllCategories } from 'interfaces/Category';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import ProductCategoriesTrees from './ProductCategoriesTrees';
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
import { Image } from '../../interfaces/Image';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import SimpleSelect from 'components/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';

const { categoriesKeys, categoriesFields } = categoriesSettings;
const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  productUtils;

const LiveProducts: React.FC<RouteComponentProps> = () => {
  const saveProductFn = saveProduct;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrand, setIsFetchingProductBrand] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);
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
  const [isViewing, setIsViewing] = useState<boolean>(false);
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

  const handleCategoryDelete = (productCategoryIndex: number) => {
    removeSearchTagsByCategory(productCategoryIndex, currentProduct, form);
  };

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

  const handleCategoryChange = (
    selectedCategories: any,
    _productCategoryIndex: number,
    filterCategory: Function,
    categoryKey: string
  ) => {
    filterCategory(form);
    setSearchTagsByCategory(
      false,
      selectedCategories,
      categoryKey,
      _productCategoryIndex
    );
  };

  const handleMasterBrandChange = (filterMasterBrand: Function) => {
    filterMasterBrand(form);
  };

  const handleProductBrandChange = (filterProductBrand: Function) => {
    filterProductBrand(form);
  };

  useEffect(() => {
    setDiscoPercentageByBrand(true);
    setSearchTagsByCategory(true);
  }, [brands, setDiscoPercentageByBrand, setSearchTagsByCategory]);

  useEffect(() => {
    if (currentProduct?.ageMin && currentProduct?.ageMax)
      setAgeRange([currentProduct?.ageMin, currentProduct?.ageMax]);
  }, [currentProduct]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setAgeRange(value);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const product = form.getFieldsValue(true);

      categoriesFields.forEach((field, index) => {
        product.categories.forEach((productCategory: any) => {
          productCategory[field] = allCategories[
            categoriesKeys[index] as keyof AllCategories
          ].find(category => category.id === productCategory[field]?.id);
        });
      });

      const response = (await saveProductFn(product)) as any;
      refreshItem(response.result);

      message.success('Register updated with success.');
      setLoading(false);
      setIsViewing(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

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
    await setLoaded(true);
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

  const refreshItem = (record: Product) => {
    products[lastViewedIndex] = record;
    setProducts([...products]);
  };

  const onSaveOnRowEdition = async (record: Product) => {
    setCurrentProduct(record);
    await saveCategories(() => saveProduct(record));
    refreshItem(record);
  };

  const onSaveProduct = async (record: Product) => {
    await doRequest(() => saveProduct(record));
    await refreshItem(record);
  };

  const editProduct = (record: Product, index: number) => {
    setCurrentProduct(record);
    setLastViewedIndex(index);
    setCurrentMasterBrand(record.brand.brandName);
    if (record.productBrand) {
      if (typeof record.productBrand === 'string') {
        setCurrentProductBrand(record.productBrand);
      } else {
        setCurrentProductBrand(record.productBrand.brandName);
      }
    }
    setIsViewing(true);
  };

  const newProduct = () => {
    setCurrentProduct(undefined);
    setCurrentMasterBrand(undefined);
    setCurrentProductBrand(undefined);
    if (loaded) {
      setLastViewedIndex(products.length);
    }
    setIsViewing(true);
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
            onClick={() => editProduct(record, index)}
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
            onClick={() => editProduct(record, index)}
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

  const handleThumbnailOrTagReplacement = (prevImage: Image) => {
    if (currentProduct) {
      if (!currentProduct.image.some(img => img.url === prevImage.url)) {
        currentProduct.image.push(prevImage);
      }
    }
  };

  const onAssignToThumbnail = (file: Image) => {
    if (currentProduct) {
      const prevThumb = { ...currentProduct.thumbnailUrl };
      currentProduct.thumbnailUrl = { ...file };
      handleThumbnailOrTagReplacement(prevThumb);
      setCurrentProduct({ ...currentProduct });
    }
  };

  const onAssignToTag = (file: Image) => {
    if (currentProduct) {
      const prevTag = { ...currentProduct.tagImage };
      currentProduct.tagImage = { ...file };
      handleThumbnailOrTagReplacement(prevTag);
      setCurrentProduct({ ...currentProduct });
    }
  };

  useEffect(() => {
    if (!isViewing) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [isViewing]);

  const updateForm = (
    _: string,
    entity: any,
    type: 'brand' | 'productBrand'
  ) => {
    setDiscoPercentageByBrand(false);
    if (type === 'brand') {
      form.setFieldsValue({ brand: entity });
    } else {
      form.setFieldsValue({ productBrand: entity });
    }
  };

  return (
    <>
      {!isViewing && (
        <>
          <PageHeader
            title="Products"
            subTitle="List of Live Products"
            extra={[
              <Button key="1" onClick={() => newProduct()}>
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
      {isViewing && (
        <div className="products-details">
          <PageHeader
            title={
              currentProduct ? `${currentProduct?.name} Update` : 'New Product'
            }
            subTitle="Form"
          />
          <Form
            form={form}
            name="productForm"
            initialValues={currentProduct}
            onFinish={onFinish}
            onFinishFailed={({ errorFields }) => {
              errorFields.forEach(errorField => {
                message.error(errorField.errors[0]);
              });
            }}
            layout="vertical"
          >
            <Tabs defaultActiveKey="Details">
              <Tabs.TabPane forceRender tab="Details" key="Details">
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
                    <Row gutter={8}>
                      <Col lg={20} xs={24}>
                        <Form.Item name="status" label="Status">
                          <Radio.Group buttonStyle="solid">
                            <Radio.Button value="live">Live</Radio.Button>
                            <Radio.Button value="paused">Paused</Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
                      <Col lg={4} xs={24}>
                        <Form.Item
                          name="outOfStock"
                          label="Out of stock"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col lg={24} xs={24}>
                        <Form.Item name="name" label="Short description">
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col lg={24} xs={24}>
                        <Form.Item label="Long description">
                          <RichTextEditor formField="description" form={form} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Row gutter={8}>
                      <Col lg={24} xs={24}>
                        <Form.Item
                          name={['brand', 'id']}
                          label="Master Brand"
                          rules={[{ required: true }]}
                        >
                          <SimpleSelect
                            data={brands}
                            onChange={(value, brand) =>
                              updateForm(value, brand, 'brand')
                            }
                            style={{ width: '100%' }}
                            selectedOption={currentProduct?.brand?.id}
                            optionsMapping={optionsMapping}
                            placeholder={'Select a brand'}
                            loading={isFetchingBrands}
                            disabled={isFetchingBrands}
                            allowClear={true}
                          ></SimpleSelect>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={8}>
                      <Col lg={12} xs={24}>
                        <Form.Item
                          name="productBrand"
                          label="Product Brand"
                          rules={[{ required: true }]}
                        >
                          <SimpleSelect
                            data={productBrands}
                            onChange={(value, brand) =>
                              updateForm(value, brand, 'productBrand')
                            }
                            style={{ width: '100%' }}
                            selectedOption={currentProductBrand}
                            optionsMapping={optionsMapping}
                            placeholder={'Select a brand'}
                            loading={isFetchingProductBrand}
                            disabled={isFetchingProductBrand}
                            allowClear={true}
                          ></SimpleSelect>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={8}>
                      <Col lg={12} xs={24}>
                        <Form.Item
                          name="goLiveDate"
                          label="Go Live Date"
                          getValueProps={formatMoment}
                        >
                          <DatePicker format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                      <Col lg={12} xs={24}>
                        <Form.Item
                          name="validity"
                          label="Expiration Date"
                          getValueProps={formatMoment}
                        >
                          <DatePicker format="DD/MM/YYYY" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane forceRender tab="Categories" key="Categories">
                <ProductCategoriesTrees
                  categories={currentProduct?.categories}
                  allCategories={allCategories}
                  form={form}
                  handleCategoryChange={handleCategoryChange}
                  handleCategoryDelete={handleCategoryDelete}
                />
                <Col lg={16} xs={24}>
                  <Form.Item
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.category !== curValues.category
                    }
                  >
                    {({ getFieldValue }) => (
                      <Form.Item name={'searchTags'} label="Search Tags">
                        <Select mode="tags" className="product-search-tags">
                          {getFieldValue('searchTags')?.map(
                            (searchTag: any) => (
                              <Select.Option key={searchTag} value={searchTag}>
                                {searchTag}
                              </Select.Option>
                            )
                          )}
                        </Select>
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
                <Row gutter={8}>
                  <Col lg={24} xs={24}>
                    <Typography.Title level={4}>Target</Typography.Title>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item label="Age Range">
                      <Slider
                        range
                        marks={{ 12: '12', 100: '100' }}
                        min={12}
                        max={100}
                        value={ageRange}
                        onChange={onChangeAge}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="gender"
                      label="Gender"
                      rules={[{ required: true }]}
                    >
                      <Select mode="multiple">
                        <Select.Option value="Female">Female</Select.Option>
                        <Select.Option value="Male">Male</Select.Option>
                        <Select.Option value="Other">Other</Select.Option>
                        <Select.Option value="Prefer not to say">
                          Prefer not to say
                        </Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane forceRender tab="Checkout" key="Checkout">
                <Row gutter={8}>
                  <Col lg={8} xs={24}>
                    <Form.Item name="currencyIsoCode" label="Default Currency">
                      <Select placeholder="Please select a currency">
                        {currency.map((curr: any) => (
                          <Select.Option key={curr.value} value={curr.value}>
                            {curr.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="originalPrice"
                      label="Default Price"
                      rules={[{ required: true }]}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={8} xs={24}>
                    <Form.Item name="currencyIsoCodeUS" label="Currency US">
                      <Select placeholder="Please select a currency">
                        {currency.map((curr: any) => (
                          <Select.Option key={curr.value} value={curr.value}>
                            {curr.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="originalPriceUS"
                      label="Price US"
                      rules={[{}]}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={8} xs={24}>
                    <Form.Item name="currencyIsoCodeGB" label="Currency UK">
                      <Select placeholder="Please select a currency">
                        {currency.map((curr: any) => (
                          <Select.Option key={curr.value} value={curr.value}>
                            {curr.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="originalPriceGB"
                      label="Price UK"
                      rules={[{}]}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={8} xs={24}>
                    <Form.Item name="currencyIsoCodeIE" label="Currency Europe">
                      <Select placeholder="Please select a currency">
                        {currency.map((curr: any) => (
                          <Select.Option key={curr.value} value={curr.value}>
                            {curr.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={8} xs={24}>
                    <Form.Item
                      name="originalPriceIE"
                      label="Price Europe"
                      rules={[{}]}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={4} xs={8}>
                    <Form.Item
                      name="displayDiscountPage"
                      label="Allow Use of DD?"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col lg={4} xs={8}>
                    <Form.Item
                      name="maxDiscoDollars"
                      label="Max Discount in DD"
                      dependencies={['originalPrice']}
                      rules={[
                        {
                          required: true,
                          message: 'Max Discount is required.',
                        },
                        ({ getFieldValue }) => ({
                          validator(_, maxDiscount) {
                            // 3x the price
                            const maxPossibleDiscount = Math.trunc(
                              Number(getFieldValue('originalPrice')) * 3
                            );
                            if (
                              maxDiscount &&
                              maxDiscount > maxPossibleDiscount
                            ) {
                              if (!maxDiscountAlert) {
                                setTimeout(
                                  () =>
                                    alert(
                                      `The largest amount of DD you can apply for this price is ${maxPossibleDiscount}.`
                                    ),
                                  100
                                );
                              }
                              setMaxDiscountAlert(true);
                              return Promise.reject(
                                new Error('Max discount not allowed.')
                              );
                            }
                            setMaxDiscountAlert(false);
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        parser={value => (value || '').replace(/-/g, '')}
                        precision={0}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={4} xs={8}>
                    <Form.Item
                      name="discoPercentage"
                      label="Disco Percentage %"
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={4} xs={8}>
                    <Form.Item
                      name="shopifyUniqueId"
                      label="Shopify Uid"
                      rules={[{}]}
                    >
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={4} xs={8}>
                    <Form.Item name="magentoId" label="Magento Id">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                  <Col lg={4} xs={8}>
                    <Form.Item name="sku" label="SKU">
                      <InputNumber />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col lg={4} xs={8}>
                    <Form.Item name="weight" label="Weight">
                      <Input type="number" placeholder="Weight in Kg" />
                    </Form.Item>
                  </Col>
                </Row>
              </Tabs.TabPane>
              <Tabs.TabPane forceRender tab="Images" key="Images">
                <Row gutter={8}>
                  <Col lg={24} xs={24}>
                    <Form.Item label="Tag Image">
                      <Upload.ImageUpload
                        fileList={currentProduct?.tagImage}
                        formProp="tagImage"
                        form={form}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item label="Thumbnail">
                      <Upload.ImageUpload
                        fileList={currentProduct?.thumbnailUrl}
                        formProp="thumbnailUrl"
                        form={form}
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item label="Image">
                      <div
                        className={
                          currentProduct
                            ? currentProduct.image
                              ? 'img-upload-div'
                              : ''
                            : ''
                        }
                      >
                        <Upload.ImageUpload
                          maxCount={20}
                          fileList={currentProduct?.image}
                          formProp="image"
                          form={form}
                          onAssignToTag={onAssignToTag}
                          onAssignToThumbnail={onAssignToThumbnail}
                          cropable={true}
                          classNames="big-image-height scroll-x"
                        />
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
              </Tabs.TabPane>
            </Tabs>

            <Row gutter={8}>
              <Col>
                <Button type="default" onClick={() => setIsViewing(false)}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button
                  disabled={currentProduct?.brand.automated === true}
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  Save Changes
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </>
  );
};

export default LiveProducts;