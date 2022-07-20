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
  Collapse,
  Form,
  Input,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import EditableTable, { EditableColumnType } from 'components/EditableTable';
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
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from 'services/DiscoClubService';
import ProductExpandedRow from './ProductExpandedRow';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import './Products.scss';
import { ProductCategory } from 'interfaces/Category';
import { SearchFilterDebounce } from 'components/SearchFilterDebounce';
import { AppContext } from 'contexts/AppContext';
import { ProductBrand } from 'interfaces/ProductBrand';
import { productUtils } from '../../helpers/product-utils';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import AlternatePreviewProducts from './AlternatePreviewProducts';
import SimpleSelect from '../../components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import ProductsDetails from './ProductsDetails';

const { getSearchTags, getCategories } = productUtils;
const { Panel } = Collapse;

const PreviewProducts: React.FC<RouteComponentProps> = () => {
  const [viewName, setViewName] = useState<'alternate' | 'default'>('default');
  const previousViewName = useRef<'alternate' | 'default'>('default');
  const saveProductFn = saveStagingProduct;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);

  const { usePageFilter } = useContext(AppContext);
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [runIdFilter, setRunIdFilter] = useState<string>();
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

  const [currentSuperCategory, setCurrentSuperCategory] =
    useState<ProductCategory>();
  const [currentCategory, setCurrentCategory] = useState<ProductCategory>();
  const [currentSubCategory, setCurrentSubCategory] =
    useState<ProductCategory>();
  const [currentSubSubCategory, setCurrentSubSubCategory] =
    useState<ProductCategory>();

  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const { isMobile } = useContext(AppContext);

  const productSuperCategoryOptionMapping: SelectOption = {
    key: 'id',
    label: 'superCategory',
    value: 'id',
  };

  const productCategoryOptionMapping: SelectOption = {
    key: 'id',
    label: 'category',
    value: 'id',
  };

  const productSubCategoryOptionMapping: SelectOption = {
    key: 'id',
    label: 'subCategory',
    value: 'id',
  };

  const productSubSubCategoryOptionMapping: SelectOption = {
    key: 'id',
    label: 'subSubCategory',
    value: 'id',
  };

  useEffect(() => {
    setCurrentCategory(undefined);
    setCurrentSubCategory(undefined);
    setCurrentSubSubCategory(undefined);
  }, [currentSuperCategory]);

  useEffect(() => {
    setCurrentSubCategory(undefined);
    setCurrentSubSubCategory(undefined);
  }, [currentCategory]);

  useEffect(() => {
    setCurrentSubSubCategory(undefined);
  }, [currentSubCategory]);

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

  const onAlternateViewSaveChanges = async (entity: Product) => {
    setLoading(true);
    try {
      const response = (await saveProductFn(entity)) as any;
      refreshItem(response.result, 'alternate');

      message.success('Register updated with success.');
    } catch (error) {
      console.error(error);
    } finally {
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
        superCategoryId: currentSuperCategory?.id,
        categoryId: currentCategory?.id,
        subCategoryId: currentSubCategory?.id,
        subSubCategoryId: currentSubSubCategory?.id,
        runId: runIdFilter,
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

  const getResources = async (event?: any, searchButton?: boolean) => {
    if (!isMobile && event) event.stopPropagation();
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

  const refreshItem = (record: Product, viewName?: 'default' | 'alternate') => {
    products[lastViewedIndex] = record;
    setProducts([...products]);
    setViewName(viewName ?? previousViewName.current);
  };

  const updateDisplayedArray = async searchButton => {
    if (!products.length) return;
    const { results } = await _fetchStagingProducts(searchButton);
    setProducts(prev => [...prev.concat(results)]);
  };

  const onSaveCategories = async (record: Product) => {
    await saveCategories(() => saveStagingProduct(record));
    await getProducts(true);
  };

  const onSaveItem = async (record: Product) => {
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
          onClick={() => editProduct(record, index, 'default')}
          to={{ pathname: window.location.pathname, state: record }}
        >
          {value}
        </Link>
      ),
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Master Brand',
      dataIndex: ['brand', 'brandName'],
      width: '15%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.brand && b.brand)
          return a.brand.brandName.localeCompare(b.brand.brandName);
        else if (a.brand) return -1;
        else if (b.brand) return 1;
        else return 0;
      },
    },
    {
      title: 'Import Run Id',
      dataIndex: 'importRunId',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
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
      sorter: (a, b): any => {
        if (a.productBrand && b.productBrand) {
          if (typeof a.productBrand === typeof b.productBrand) {
            if (typeof a.productBrand === 'string') {
              return a.productBrand.localeCompare(
                b.productBrand as string
              ) as any;
            }
            if (
              typeof a.productBrand !== 'string' &&
              typeof b.productBrand !== 'string'
            ) {
              return a.productBrand?.brandName.localeCompare(
                b.productBrand?.brandName as string
              ) as any;
            }
          }
          if (
            typeof a.productBrand === 'string' &&
            typeof b.productBrand !== 'string'
          ) {
            return a.productBrand.localeCompare(
              b.productBrand?.brandName as any
            ) as any;
          }
          if (
            typeof a.productBrand !== 'string' &&
            typeof b.productBrand === 'string'
          ) {
            return a.productBrand?.brandName.localeCompare(
              b.productBrand as string
            ) as any;
          }
        } else if (a.productBrand) return -1;
        else if (b.productBrand) return 1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.outOfStock && b.outOfStock) return 0;
        else if (a.outOfStock) return -1;
        else if (b.outOfStock) return 1;
        else return 0;
      },
    },
    {
      title: 'Currency',
      dataIndex: 'currencyIsoCode',
      width: '7%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.currencyIsoCode && b.currencyIsoCode)
          return a.currencyIsoCode.localeCompare(b.currencyIsoCode);
        else if (a.currencyIsoCode) return -1;
        else if (b.currencyIsoCode) return 1;
        else return 0;
      },
    },
    {
      title: 'Price',
      dataIndex: 'originalPrice',
      width: '7%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.originalPrice && b.originalPrice)
          return a.originalPrice - b.originalPrice;
        else if (a.originalPrice) return -1;
        else if (b.originalPrice) return 1;
        else return 0;
      },
    },
    {
      title: 'Max DD',
      dataIndex: 'maxDiscoDollars',
      width: '7%',
      align: 'center',
      editable: true,
      number: true,
      sorter: (a, b): any => {
        if (a.maxDiscoDollars && b.maxDiscoDollars)
          return a.maxDiscoDollars - b.maxDiscoDollars;
        else if (a.maxDiscoDollars) return -1;
        else if (b.maxDiscoDollars) return 1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.offerExpirationDate && b.offerExpirationDate)
          return (
            moment(a.offerExpirationDate).unix() -
            moment(b.offerExpirationDate).unix()
          );
        else if (a.offerExpirationDate) return -1;
        else if (b.offerExpirationDate) return 1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.lastGoLiveDate && b.lastGoLiveDate)
          return (
            moment(a.lastGoLiveDate).unix() - moment(b.lastGoLiveDate).unix()
          );
        else if (a.lastGoLiveDate) return -1;
        else if (b.lastGoLiveDate) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '12%',
      align: 'right',
      render: (_, record: Product, index: number) => (
        <>
          <Link
            onClick={() => editProduct(record, index, 'default')}
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

  const createProduct = (index: number) => {
    setCurrentProduct(undefined);
    setCurrentMasterBrand(undefined);
    setCurrentProductBrand(undefined);
    setLastViewedIndex(index);
    setDetails(true);
  };

  const editProduct = (
    product: Product,
    productIndex: number,
    viewName: 'default' | 'alternate'
  ) => {
    previousViewName.current = viewName;
    setCurrentProduct(product);
    setLastViewedIndex(productIndex);
    setCurrentMasterBrand(product.brand.brandName);
    if (product.productBrand) {
      if (typeof product.productBrand === 'string') {
        setCurrentProductBrand(product.productBrand);
      } else {
        setCurrentProductBrand(product.productBrand.brandName);
      }
    } else {
      setCurrentProductBrand('');
    }
    setViewName('default');
    setDetails(true);
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

  const onSaveProduct = (product: Product) => {
    refreshItem(product);
    setCurrentProduct(product);
    setDetails(false);
  };

  const onCancelProduct = () => {
    if (previousViewName.current === 'alternate') setViewName('alternate');
    setDetails(false);
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
          <AlternatePreviewProducts
            products={products}
            productBrands={productBrands}
            allCategories={allCategories}
            onSaveChanges={onAlternateViewSaveChanges}
            lastViewedIndex={lastViewedIndex}
            onRefreshItem={product => refreshItem(product, 'alternate')}
            onEditProduct={(product, productIndex) =>
              editProduct(product, productIndex, 'alternate')
            }
            onNextPage={() => updateDisplayedArray(false)}
            page={page}
            eof={eof}
          ></AlternatePreviewProducts>
        );
      case 'default':
        if (!details) {
          return (
            <>
              <InfiniteScroll
                dataLength={products.length}
                next={() => updateDisplayedArray(false)}
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
                  scroll={{ x: true }}
                  className="mt-2"
                  rowClassName={(_, index) =>
                    `scrollable-row-${index} ${
                      index === lastViewedIndex ? 'selected-row' : ''
                    }`
                  }
                  rowKey="id"
                  columns={columns}
                  dataSource={products}
                  loading={loading}
                  onSave={onSaveItem}
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
                        isStaging
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
            <ProductsDetails
              brands={brands}
              productBrands={productBrands}
              allCategories={allCategories}
              onSave={onSaveProduct}
              onCancel={onCancelProduct}
              product={currentProduct}
              productBrand={currentProductBrand}
              brand={currentMasterBrand}
              isFetchingBrands={isFetchingBrands}
              isFetchingProductBrand={isFetchingProductBrands}
              isLive={false}
            />
          );
        }
      default:
        return <h1>Houston...</h1>;
    }
  };

  const Filters = () => {
    return (
      <>
        <Row
          align="bottom"
          justify={isMobile ? 'end' : 'space-between'}
          className="pt-0"
        >
          <Col lg={20} xs={24}>
            <Row gutter={[8, 8]}>
              <Col lg={5} xs={24}>
                <SearchFilterDebounce
                  initialValue={searchFilter}
                  filterFunction={setSearchFilter}
                  placeholder="Search by Name"
                  label="Product Name"
                  onPressEnter={() => getResources(true)}
                />
              </Col>
              <Col lg={5} xs={24}>
                <Typography.Title level={5}>Master Brand</Typography.Title>
                <SimpleSelect
                  data={brands}
                  onChange={(_, brand) => onChangeBrand(brand)}
                  style={{ width: '100%' }}
                  selectedOption={brandFilter?.brandName}
                  optionMapping={optionMapping}
                  placeholder={'Select a Master Brand'}
                  loading={isFetchingBrands}
                  disabled={isFetchingBrands}
                  allowClear={true}
                ></SimpleSelect>
              </Col>
              <Col lg={5} xs={24}>
                <Typography.Title level={5}>Product Brand</Typography.Title>
                <SimpleSelect
                  data={productBrands}
                  onChange={(_, productBrand) =>
                    onChangeProductBrand(productBrand)
                  }
                  style={{ width: '100%' }}
                  selectedOption={productBrandFilter?.brandName}
                  optionMapping={optionMapping}
                  placeholder={'Select a Product Brand'}
                  loading={isFetchingProductBrands}
                  disabled={isFetchingProductBrands}
                  allowClear={true}
                ></SimpleSelect>
              </Col>
              <Col lg={5} xs={24}>
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
              <Col lg={5} xs={24}>
                <Typography.Title level={5}>Super Category</Typography.Title>
                <SimpleSelect
                  data={allCategories['Super Category'].filter(item => {
                    return (
                      item.superCategory === 'Women' ||
                      item.superCategory === 'Men' ||
                      item.superCategory === 'Children'
                    );
                  })}
                  onChange={(_, category) => setCurrentSuperCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentSuperCategory?.id}
                  optionMapping={productSuperCategoryOptionMapping}
                  placeholder={'Select a Super Category'}
                  loading={fetchingCategories}
                  disabled={fetchingCategories}
                  allowClear={true}
                ></SimpleSelect>
              </Col>
              <Col lg={5} xs={24}>
                <Typography.Title level={5}>Category</Typography.Title>
                <SimpleSelect
                  data={allCategories.Category.filter(item => {
                    return currentSuperCategory
                      ? item.superCategory ===
                          currentSuperCategory.superCategory
                      : true;
                  })}
                  onChange={(_, category) => setCurrentCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentCategory?.id ?? null}
                  optionMapping={productCategoryOptionMapping}
                  placeholder={'Select a Category'}
                  loading={fetchingCategories}
                  disabled={fetchingCategories}
                  allowClear={true}
                ></SimpleSelect>
              </Col>
              <Col lg={5} xs={24}>
                <Typography.Title level={5}>Sub Category</Typography.Title>
                <SimpleSelect
                  data={allCategories['Sub Category'].filter(item => {
                    return (
                      (currentCategory
                        ? item.category === currentCategory.category
                        : true) &&
                      (currentSuperCategory
                        ? item.superCategory ===
                          currentSuperCategory.superCategory
                        : true)
                    );
                  })}
                  onChange={(_, category) => setCurrentSubCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentSubCategory?.id ?? null}
                  optionMapping={productSubCategoryOptionMapping}
                  placeholder={'Select a Sub Category'}
                  loading={fetchingCategories}
                  disabled={
                    fetchingCategories ||
                    !allCategories['Sub Category'].filter(item => {
                      return (
                        (currentCategory
                          ? item.category === currentCategory.category
                          : true) &&
                        (currentSuperCategory
                          ? item.superCategory ===
                            currentSuperCategory.superCategory
                          : true)
                      );
                    }).length
                  }
                  allowClear={true}
                ></SimpleSelect>
              </Col>
              <Col lg={5} xs={24}>
                <Typography.Title level={5}>Sub Sub Category</Typography.Title>
                <SimpleSelect
                  data={allCategories['Sub Sub Category'].filter(item => {
                    return (
                      (currentSubCategory
                        ? item.subCategory === currentSubCategory.subCategory
                        : true) &&
                      (currentCategory
                        ? item.category === currentCategory.category
                        : true) &&
                      (currentSuperCategory
                        ? item.superCategory ===
                          currentSuperCategory.superCategory
                        : true)
                    );
                  })}
                  onChange={(_, category) => setCurrentSubSubCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentSubSubCategory?.id ?? null}
                  optionMapping={productSubSubCategoryOptionMapping}
                  placeholder={'Select a Sub Sub Category'}
                  loading={fetchingCategories}
                  disabled={
                    fetchingCategories ||
                    !allCategories['Sub Sub Category'].filter(item => {
                      return (
                        (currentSubCategory
                          ? item.subCategory === currentSubCategory.subCategory
                          : true) &&
                        (currentCategory
                          ? item.category === currentCategory.category
                          : true) &&
                        (currentSuperCategory
                          ? item.superCategory ===
                            currentSuperCategory.superCategory
                          : true)
                      );
                    }).length
                  }
                  allowClear={true}
                ></SimpleSelect>
              </Col>
              <Col lg={5} xs={24}>
                <Typography.Title level={5}>Run ID</Typography.Title>
                <Input
                  onChange={evt => {
                    setRunIdFilter(evt.target.value);
                  }}
                  value={runIdFilter}
                  suffix={<SearchOutlined />}
                  placeholder="Search by Run ID"
                />
              </Col>
              <Col lg={5} xs={24}>
                <Checkbox
                  onChange={handleFilterOutOfStock}
                  className={isMobile ? 'mt-1 mb-1' : 'mt-2 mb-1 ml-05'}
                >
                  Out of Stock only
                </Checkbox>
              </Col>
              <Col lg={5} xs={24}>
                <Checkbox
                  onChange={handleFilterClassified}
                  className={isMobile ? 'mb-2' : 'mt-2 mb-1 ml-05'}
                >
                  Unclassified only
                </Checkbox>
              </Col>
            </Row>
          </Col>
          {isMobile && (
            <Col>
              <Row justify="end">
                <Col>
                  <Button
                    type="primary"
                    onClick={event => getResources(event, true)}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </>
    );
  };

  return (
    <>
      {!details && (
        <>
          <PageHeader
            title="Preview Products"
            subTitle={
              isMobile
                ? ''
                : viewName === 'default'
                ? 'Default View'
                : 'Alternate View'
            }
            className={isMobile ? 'mb-n1' : ''}
            extra={[
              <Row gutter={8} justify="end">
                <Col>
                  <Button
                    key="1"
                    className={isMobile ? 'mt-05' : ''}
                    onClick={() => createProduct(products.length)}
                  >
                    New Item
                  </Button>
                </Col>
                <Col>
                  <Button
                    key="1"
                    type="primary"
                    className={isMobile ? 'mt-05' : ''}
                    onClick={switchView}
                  >
                    Switch View
                  </Button>
                </Col>
              </Row>,
            ]}
          />
          <Collapse ghost className="sticky-filter-box">
            <Panel
              header={<Typography.Title level={5}>Filters</Typography.Title>}
              key="1"
              extra={
                !isMobile && (
                  <Button
                    type="primary"
                    onClick={event => getResources(event, true)}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                )
              }
            >
              <Filters />
            </Panel>
          </Collapse>
          {isMobile && (
            <Row justify="end">
              <Col className="mt-n2">
                <Button
                  type="primary"
                  onClick={getResources}
                  loading={loading}
                  style={{ position: 'relative', top: '32px' }}
                  className="mr-1"
                >
                  Search
                  <SearchOutlined style={{ color: 'white' }} />
                </Button>
              </Col>
            </Row>
          )}
        </>
      )}
      {buildView()}
    </>
  );
};

export default PreviewProducts;
