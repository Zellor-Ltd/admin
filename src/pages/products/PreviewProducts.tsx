import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
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
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import EditableTable, { EditableColumnType } from 'components/EditableTable';
import EditMultipleButton from 'components/EditMultipleButton';
import useAllCategories from 'hooks/useAllCategories';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Product } from 'interfaces/Product';
import moment from 'moment';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteStagingProduct,
  fetchBrands,
  fetchProductBrands,
  fetchProducts,
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from 'services/DiscoClubService';
import EditProductModal from './EditProductModal';
import ProductExpandedRow from './ProductExpandedRow';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import ProductCategoriesTrees from './ProductCategoriesTrees';
import './Products.scss';
import { Upload } from 'components';
import { RichTextEditor } from 'components/RichTextEditor';
import { formatMoment } from 'helpers/formatMoment';
import { categoriesSettings } from 'helpers/utils';
import { AllCategories, ProductCategory } from 'interfaces/Category';
import { useSelector } from 'react-redux';
import { SearchFilterDebounce } from 'components/SearchFilterDebounce';
import { AppContext } from 'contexts/AppContext';
import update from 'immutability-helper';
import { ProductBrand } from 'interfaces/ProductBrand';
import { productUtils } from '../../helpers/product-utils';
import { Image } from '../../interfaces/Image';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import AlternatePreviewList from './AlternatePreviewList';
import SimpleSelect from '../../components/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';

const { categoriesKeys, categoriesFields } = categoriesSettings;
const { getSearchTags, getCategories, removeSearchTagsByCategory } =
  productUtils;

const PreviewProducts: React.FC<RouteComponentProps> = () => {
  const [viewName, setViewName] = useState<'alternate' | 'default'>('default');
  const previousViewName = useRef('default');
  const saveProductFn = saveStagingProduct;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [maxDiscountAlert, setMaxDiscountAlert] = useState<boolean>(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);

  const { usePageFilter } = useContext(AppContext);
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [brandFilter, setBrandFilter] = useState<Brand | undefined>();
  const [productBrandFilter, setProductBrandFilter] = useState<
    ProductBrand | undefined
  >();
  const [outOfStockFilter, setOutOfStockFilter] = useState<boolean>(false);
  const [unclassifiedFilter, setUnclassifiedFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [currentMasterBrand, setCurrentMasterBrand] = useState<string>();
  const [currentProductBrand, setCurrentProductBrand] = useState<string>();
  const [productStatusFilter, setProductStatusFilter] =
    useState<string>('live');

  const [productCategoryFilter, setProductCategoryFilter] =
    useState<ProductCategory>();
  const [productSubCategoryFilter, setProductSubCategoryFilter] =
    useState<ProductCategory>();
  const [productSubSubCategoryFilter, setProductSubSubCategoryFilter] =
    useState<ProductCategory>();

  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const {
    settings: { currency = [] },
  } = useSelector((state: any) => state.settings);

  const productCategoryOptionsMapping: SelectOption = {
    key: 'id',
    label: 'category',
    value: 'id',
  };

  const productSubCategoryOptionsMapping: SelectOption = {
    key: 'id',
    label: 'subCategory',
    value: 'id',
  };

  const productSubSubCategoryOptionsMapping: SelectOption = {
    key: 'id',
    label: 'subSubCategory',
    value: 'id',
  };

  // useEffect(() => {
  //   setProductCategories(allCategories.Category);
  //   console.log('Category ->', allCategories.Category);
  // }, [allCategories.Category]);

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
        currentProduct.searchTags = searchTags;
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

  const refreshProducts = async () => {
    setSelectedRowKeys([]);
    setPage(0);
    setRefreshing(true);
  };

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

  useMount(async () => {
    const getProductBrands = async () => {
      setIsFetchingProductBrands(true);
      const { results }: any = await fetchProductBrands();
      setProductBrands(results);
      setIsFetchingProductBrands(false);
    };

    const getBrands = async () => {
      setIsFetchingBrands(true);
      const { results }: any = await fetchBrands();
      setBrands(results);
      setIsFetchingBrands(false);
    };

    await Promise.all([getBrands(), getProductBrands(), fetchAllCategories()]);
  });

  useEffect(() => {
    if (loaded) {
      refreshProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter]);

  useEffect(() => {
    setDiscoPercentageByBrand(true);
    setSearchTagsByCategory(true);
  }, [brands, setDiscoPercentageByBrand, setSearchTagsByCategory]);

  useEffect(() => {
    if (refreshing) {
      setEof(false);
      getProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshing]);

  useEffect(() => {
    if (currentProduct?.ageMin && currentProduct?.ageMax)
      setageRange([currentProduct?.ageMin, currentProduct?.ageMax]);
  }, [currentProduct]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setageRange(value);
  };

  const onFinish = async () => {
    setLoading(true);
    try {
      const product = form.getFieldsValue(true);
      product.brand = brands?.find(brand => brand.id === product.brand?.id);

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
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const onAlternateViewSaveChanges = async (entity: Product, index: number) => {
    setLoading(true);
    try {
      const response = (await saveProductFn(entity)) as any;
      refreshItem(response.result, index);

      message.success('Register updated with success.');
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleFilterClassified = (e: CheckboxChangeEvent) => {
    setUnclassifiedFilter(e.target.checked);
  };

  const _fetchStagingProducts = async searchButton => {
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchStagingProducts({
        limit: 30,
        page: pageToUse,
        brandId: brandFilter?.id,
        query: searchFilter,
        unclassified: unclassifiedFilter,
        productBrandId: productBrandFilter?.id,
        outOfStock: outOfStockFilter,
        status: productStatusFilter,
        categoryId: productCategoryFilter?.id,
        subCategoryId: productSubCategoryFilter?.id,
        subSubCategoryId: productSubSubCategoryFilter?.id,
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

  const getResources = async searchButton => {
    setLoading(true);
    const { results } = await _fetchStagingProducts(searchButton);

    setLoaded(true);
    setProducts(results);
    setLoading(false);
  };

  const getProducts = async searchButton => {
    const { results } = await doFetch(() =>
      _fetchStagingProducts(searchButton)
    );
    setProducts(results);
  };

  useEffect(() => form.resetFields(), [currentProduct]);

  const deleteItem = async (_id: string, index: number) => {
    await doRequest(() => deleteStagingProduct(_id));
    setProducts(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const refreshItem = (record: Product, index?: number) => {
    products[index ?? lastViewedIndex] = record;
    setProducts([...products]);
  };

  const fetchData = async searchButton => {
    if (!products.length) return;
    const { results } = await _fetchStagingProducts(searchButton);
    setProducts(prev => [...prev.concat(results)]);
  };

  const onSaveCategories = async (record: Product) => {
    await saveCategories(() => saveStagingProduct(record));
    await getProducts(true);
  };

  const onSaveProduct = async (record: Product) => {
    await doRequest(() => saveStagingProduct(record));
    await getProducts(true);
  };

  const handleStage = async (productId: string) => {
    await doRequest(() => transferStageProduct(productId), 'Product commited.');
    await getProducts(true);
  };

  const handleFilterOutOfStock = (e: CheckboxChangeEvent) => {
    setOutOfStockFilter(e.target.checked);
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
      width: '15%',
      render: (value: string, record: Product, index: number) => (
        <Link
          onClick={() => editProduct(record, index)}
          to={{ pathname: window.location.pathname, state: record }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'Master Brand',
      dataIndex: ['brand', 'brandName'],
      width: '15%',
      align: 'center',
    },
    {
      title: 'Product Brand',
      dataIndex: ['productBrand'],
      width: '12%',
      align: 'center',
      responsive: ['sm'],
      render: (field, record) =>
        typeof record.productBrand === 'string'
          ? field
          : record.productBrand?.brandName,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: '5%',
      align: 'center',
    },
    {
      title: 'In Stock',
      dataIndex: 'outOfStock',
      width: '7%',
      align: 'center',
      render: (outOfStock: boolean) => (outOfStock ? 'No' : 'Yes'),
    },
    {
      title: 'Currency',
      dataIndex: 'currencyIsoCode',
      width: '7%',
      align: 'center',
    },
    {
      title: 'Price',
      dataIndex: 'originalPrice',
      width: '7%',
      align: 'center',
    },
    {
      title: 'Max DD',
      dataIndex: 'maxDiscoDollars',
      width: '7%',
      align: 'center',
      editable: true,
      number: true,
    },
    {
      title: 'Last Import',
      dataIndex: 'lastImportDate',
      width: '12.5%',
      align: 'center',
      render: (lastImportDate: Date | null | undefined) =>
        lastImportDate ? (
          <>
            <div>
              {moment(lastImportDate).format('DD/MM/YY')}{' '}
              {moment(lastImportDate).format('HH:mm')}
            </div>
          </>
        ) : (
          ''
        ),
    },
    {
      title: 'Last Go-Live',
      dataIndex: 'lastGoLiveDate',
      width: '12.5%',
      align: 'center',
      render: (lastGoLiveDate: Date | null | undefined) =>
        lastGoLiveDate ? (
          <>
            <div>
              {moment(lastGoLiveDate).format('DD/MM/YY')}{' '}
              {moment(lastGoLiveDate).format('HH:mm')}
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
      render: (_, record: Product, index: number) => (
        <>
          <Link
            onClick={() => editProduct(record, index)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id, index)}
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
            style={{ color: 'green', padding: 0, margin: 6 }}
          >
            <ArrowRightOutlined />
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

  const handleEditProducts = async () => {
    await fetchProducts({});
    setSelectedRowKeys([]);
  };

  const editProduct = (record: Product, index) => {
    previousViewName.current = 'default';
    setCurrentProduct(record);
    setLastViewedIndex(index);
    setCurrentMasterBrand(record.brand.brandName);
    if (record.productBrand) {
      if (typeof record.productBrand === 'string') {
        setCurrentProductBrand(record.productBrand);
      } else {
        setCurrentProductBrand(record.productBrand.brandName);
      }
    } else {
      setCurrentProductBrand('');
    }
    setIsEditing(true);
  };

  const handleMasterBrandChange = (filterMasterBrand: Function) => {
    filterMasterBrand(form);
  };

  const handleProductBrandChange = (filterProductBrand: Function) => {
    filterProductBrand(form);
  };

  const onOrderImages = (dragIndex: number, hoverIndex: number) => {
    if (currentProduct) {
      const dragImage = currentProduct?.image[dragIndex];
      currentProduct.image = update(currentProduct.image as any, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragImage],
        ],
      });

      setCurrentProduct({ ...currentProduct });
    }
  };

  const onFitTo = (
    fitTo: 'w' | 'h',
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number
  ) => {
    if (!sourceProp) {
      throw new Error('missing sourceProp parameter');
    }
    if (currentProduct) {
      switch (sourceProp) {
        case 'image':
          if (currentProduct[sourceProp][imageIndex].fitTo === fitTo) {
            currentProduct[sourceProp][imageIndex].fitTo = undefined;
          } else {
            currentProduct[sourceProp][imageIndex].fitTo = fitTo;
          }
          break;
        default:
          if (currentProduct[sourceProp].fitTo === fitTo) {
            currentProduct[sourceProp].fitTo = undefined;
          } else {
            currentProduct[sourceProp].fitTo = fitTo;
          }
      }

      setCurrentProduct({ ...currentProduct });
    }
  };

  const onRollback = (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number
  ) => {
    if (currentProduct) {
      switch (sourceProp) {
        case 'image':
          currentProduct[sourceProp][imageIndex].url = oldUrl;
          break;
        default:
          currentProduct[sourceProp].url = oldUrl;
      }

      setCurrentProduct({ ...currentProduct });
    }
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
    if (!isEditing) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [isEditing]);

  const cancelEdit = () => {
    if (previousViewName.current === 'alternate') setViewName('alternate');
    setIsEditing(false);
  };

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

  const switchView = () => {
    if (viewName === 'default') {
      setViewName('alternate');
    } else {
      setViewName('default');
    }
  };

  const buildView = () => {
    switch (viewName) {
      case 'alternate':
        return (
          <AlternatePreviewList
            setViewName={setViewName}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            loaded={loaded}
            products={products}
            setProducts={setProducts}
            productBrands={productBrands}
            currentProduct={currentProduct}
            setCurrentProduct={setCurrentProduct}
            setCurrentMasterBrand={setCurrentMasterBrand}
            setCurrentProductBrand={setCurrentProductBrand}
            page={page}
            setPage={setPage}
            brandFilter={brandFilter}
            searchFilter={searchFilter}
            unclassifiedFilter={unclassifiedFilter}
            productBrandFilter={productBrandFilter}
            outOfStockFilter={outOfStockFilter}
            productStatusFilter={productStatusFilter}
            refreshing={refreshing}
            setRefreshing={setRefreshing}
            allCategories={allCategories}
            previousViewName={previousViewName}
            onSaveChanges={onAlternateViewSaveChanges}
          ></AlternatePreviewList>
        );
      case 'default':
        if (!isEditing) {
          return (
            <>
              <InfiniteScroll
                dataLength={products.length}
                next={() => fetchData(false)}
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
                  loading={loading}
                  onSave={onSaveProduct}
                  pagination={false}
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
                        isStaging={true}
                        productBrands={productBrands}
                      ></ProductExpandedRow>
                    ),
                  }}
                />
              </InfiniteScroll>
            </>
          );
        } else {
          return (
            <div className="products-details">
              <PageHeader
                title={
                  currentProduct ? `${currentProduct?.name} Update` : 'New Item'
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
                                <Radio.Button value="paused">
                                  Paused
                                </Radio.Button>
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
                              <RichTextEditor
                                formField="description"
                                form={form}
                              />
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
                                selectedOption={currentMasterBrand}
                                optionsMapping={optionsMapping}
                                placeholder={'Select a brand'}
                                loading={isFetchingBrands}
                                disabled={isFetchingBrands}
                                showSearch={true}
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
                                loading={isFetchingProductBrands}
                                disabled={isFetchingProductBrands}
                                showSearch={true}
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
                                  <Select.Option
                                    key={searchTag}
                                    value={searchTag}
                                  >
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
                        <Form.Item
                          name="currencyIsoCode"
                          label="Default Currency"
                        >
                          <Select placeholder="Please select a currency">
                            {currency.map((curr: any) => (
                              <Select.Option
                                key={curr.value}
                                value={curr.value}
                              >
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
                              <Select.Option
                                key={curr.value}
                                value={curr.value}
                              >
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
                              <Select.Option
                                key={curr.value}
                                value={curr.value}
                              >
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
                        <Form.Item
                          name="currencyIsoCodeIE"
                          label="Currency Europe"
                        >
                          <Select placeholder="Please select a currency">
                            {currency.map((curr: any) => (
                              <Select.Option
                                key={curr.value}
                                value={curr.value}
                              >
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
                      <Col lg={24} xs={24} className="mt-1">
                        <Form.Item label="Tag Image">
                          <Upload.ImageUpload
                            fileList={currentProduct?.tagImage}
                            formProp="tagImage"
                            form={form}
                            onFitTo={onFitTo}
                            onRollback={onRollback}
                          />
                        </Form.Item>
                      </Col>
                      <Col lg={24} xs={24} className="mt-1">
                        <Form.Item label="Thumbnail">
                          <Upload.ImageUpload
                            fileList={currentProduct?.thumbnailUrl}
                            formProp="thumbnailUrl"
                            form={form}
                            onFitTo={onFitTo}
                            onRollback={onRollback}
                          />
                        </Form.Item>
                      </Col>
                      <Col lg={24} xs={24} className="mt-1">
                        <Form.Item label="Image">
                          <div className="img-upload-div">
                            <Upload.ImageUpload
                              maxCount={20}
                              fileList={currentProduct?.image}
                              formProp="image"
                              form={form}
                              onOrder={onOrderImages}
                              onFitTo={onFitTo}
                              onAssignToThumbnail={onAssignToThumbnail}
                              onAssignToTag={onAssignToTag}
                              cropable={true}
                              onRollback={onRollback}
                              classNames="big-image-height scroll-x"
                            />
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Tabs.TabPane>
                </Tabs>

                <Row gutter={8} style={{ marginTop: '1.5rem' }}>
                  <Col>
                    <Button type="default" onClick={() => cancelEdit()}>
                      Cancel
                    </Button>
                  </Col>
                  <Col>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Save Changes
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          );
        }
      default:
        return <h1>Houston...</h1>;
    }
  };

  return (
    <>
      {!isEditing && (
        <>
          <PageHeader
            title="Preview Products"
            subTitle="List of Products in Preview Mode (not live)"
            extra={[
              <Button key="1" type="primary" onClick={switchView}>
                Switch View
              </Button>,
            ]}
          />
          <Row align="bottom" justify="space-between">
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={6} xs={24}>
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
                    showSearch={true}
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
                    loading={isFetchingProductBrands}
                    disabled={isFetchingProductBrands}
                    showSearch={true}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Status</Typography.Title>
                  <Select
                    placeholder="Select a Status"
                    style={{ width: '100%' }}
                    onChange={(value: string) => setProductStatusFilter(value)}
                    allowClear={true}
                    defaultValue={productStatusFilter}
                  >
                    <Select.Option value="live">Live</Select.Option>
                    <Select.Option value="paused">Paused</Select.Option>
                  </Select>
                </Col>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Category</Typography.Title>
                  <SimpleSelect
                    data={allCategories.Category}
                    onChange={(_, category) =>
                      setProductCategoryFilter(category)
                    }
                    style={{ width: '100%' }}
                    selectedOption={productCategoryFilter?.id}
                    optionsMapping={productCategoryOptionsMapping}
                    placeholder={'Select a Category'}
                    loading={fetchingCategories}
                    disabled={fetchingCategories}
                    showSearch={true}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Sub Category</Typography.Title>
                  <SimpleSelect
                    data={allCategories['Sub Category']}
                    onChange={(_, category) =>
                      setProductSubCategoryFilter(category)
                    }
                    style={{ width: '100%' }}
                    selectedOption={productSubCategoryFilter?.id}
                    optionsMapping={productSubCategoryOptionsMapping}
                    placeholder={'Select a Sub Category'}
                    loading={fetchingCategories}
                    disabled={fetchingCategories}
                    showSearch={true}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>
                    Sub Sub Category
                  </Typography.Title>
                  <SimpleSelect
                    data={allCategories['Sub Sub Category']}
                    onChange={(_, category) =>
                      setProductSubSubCategoryFilter(category)
                    }
                    style={{ width: '100%' }}
                    selectedOption={productSubSubCategoryFilter?.id}
                    optionsMapping={productSubSubCategoryOptionsMapping}
                    placeholder={'Select a Sub SubCategory'}
                    loading={fetchingCategories}
                    disabled={fetchingCategories}
                    showSearch={true}
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
                <Col lg={6} xs={24}>
                  <Checkbox
                    onChange={handleFilterClassified}
                    style={{ margin: '42px 0 16px 8px' }}
                  >
                    Unclassified only
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
                    onOk={handleEditProducts}
                  />
                </div>
              </Row>
            </Col>
          </Row>
        </>
      )}
      {buildView()}
    </>
  );
};

export default PreviewProducts;
