/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  EyeOutlined,
  SearchOutlined,
  SettingOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  PageHeader,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import './Products.scss';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import EditableTable, { EditableColumnType } from 'components/EditableTable';
import { AppContext } from 'contexts/AppContext';
import useAllCategories from 'hooks/useAllCategories';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Product } from 'interfaces/Product';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  fetchBrands,
  fetchProductBrands,
  fetchProducts,
  saveProduct,
} from 'services/DiscoClubService';
import ProductAPITestModal from './ProductAPITestModal';
import ProductExpandedRow from './ProductExpandedRow';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ProductBrand } from 'interfaces/ProductBrand';
import { productUtils } from '../../helpers/product-utils';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import ProductDetail from './ProductDetail';
import { ProductCategory } from 'interfaces/Category';

const { getSearchTags, getCategories } = productUtils;
const { Panel } = Collapse;

const LiveProducts: React.FC<RouteComponentProps> = () => {
  const inputRef = useRef<any>(null);
  const [activeKey, setActiveKey] = useState<string>('0');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrand, setIsFetchingProductBrand] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });
  const { usePageFilter } = useContext(AppContext);
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
  const loaded = useRef<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [products, setProducts] = useState<Product[]>([]);
  const [productStatusFilter, setProductStatusFilter] =
    useState<string>('live');
  const [runIdFilter, setRunIdFilter] = useState<string>();

  const [productSuperCategoryFilter, setProductSuperCategoryFilter] =
    useState<ProductCategory>();
  const [productCategoryFilter, setProductCategoryFilter] =
    useState<ProductCategory>();
  const [productSubCategoryFilter, setProductSubCategoryFilter] =
    useState<ProductCategory>();
  const [productSubSubCategoryFilter, setProductSubSubCategoryFilter] =
    useState<ProductCategory>();

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

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

  const { isMobile } = useContext(AppContext);

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
    if (inputRef.current)
      inputRef.current.focus({
        cursor: 'end',
      });
  }, [searchFilter]);

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

  const _fetchProducts = async (resetResults?: boolean) => {
    scrollToCenter(0);
    const pageToUse = resetResults ? 0 : page;
    const response = await doFetch(() =>
      fetchProducts({
        limit: 30,
        page: pageToUse,
        brandId: brandFilter?.id,
        query: searchFilter,
        unclassified: false,
        productBrandId: productBrandFilter?.id,
        outOfStock: outOfStockFilter,
        status: productStatusFilter,
        superCategoryId: productSuperCategoryFilter?.id,
        categoryId: productCategoryFilter?.id,
        subCategoryId: productSubCategoryFilter?.id,
        subSubCategoryId: productSubSubCategoryFilter?.id,
        runId: runIdFilter,
      })
    );
    setPage(pageToUse + 1);
    if (response.results.length < 30) setEof(true);
    return response;
  };

  const getProducts = async (resetResults?: boolean) => {
    if (!resetResults && !products.length) return;
    const { results } = await doFetch(() => _fetchProducts(resetResults));
    if (resetResults) {
      setEof(false);
      setProducts(results);
    } else setProducts(prev => [...prev.concat(results)]);
    if (!loaded.current) loaded.current = true;
  };

  useEffect(() => form.resetFields(), [currentProduct]);

  const onSaveOnRowEdition = async (record: Product) => {
    setCurrentProduct(record);
    await saveCategories(() => saveProduct(record));
    refreshItem(record);
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: 'Id',
      dataIndex: 'id',
      width: '1%',
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
            onClick={() => viewProduct(index, record)}
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
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.brand != nextRecord.brand,
      sorter: (a, b): any => {
        if (a.brand && b.brand)
          return a.brand.brandName.localeCompare(b.brand.brandName);
        else if (a.brand) return -1;
        else if (b.brand) return 1;
        else return 0;
      },
    },
    {
      title: 'In Stock',
      dataIndex: 'outOfStock',
      width: '7%',
      align: 'center',
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.outOfStock != nextRecord.outOfStock,
      render: (outOfStock: boolean) => (outOfStock ? 'No' : 'Yes'),
      sorter: (a, b): any => {
        if (a.outOfStock && b.outOfStock) return 0;
        else if (a.outOfStock) return -1;
        else if (b.outOfStock) return 1;
        else return 0;
      },
    },
    {
      title: 'Max DD',
      dataIndex: 'maxDiscoDollars',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.maxDiscoDollars != nextRecord.maxDiscoDollars,
      sorter: (a, b): any => {
        if (a.maxDiscoDollars && b.maxDiscoDollars)
          return a.maxDiscoDollars - b.maxDiscoDollars;
        else if (a.maxDiscoDollars) return -1;
        else if (b.maxDiscoDollars) return 1;
        else return 0;
      },
    },
    {
      title: 'Disco %',
      dataIndex: 'discoPercentage',
      width: '8%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.discoPercentage != nextRecord.discoPercentage,
      sorter: (a, b): any => {
        if (a.discoPercentage && b.discoPercentage)
          return a.discoPercentage - b.discoPercentage;
        else if (a.discoPercentage) return -1;
        else if (b.discoPercentage) return 1;
        else return 0;
      },
    },
    {
      title: 'Shopify Id',
      dataIndex: 'shopifyUniqueId',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
      sorter: (a, b): any => {
        if (a.shopifyUniqueId && b.shopifyUniqueId)
          return a.shopifyUniqueId.localeCompare(b.shopifyUniqueId);
        else if (a.shopifyUniqueId) return -1;
        else if (b.shopifyUniqueId) return 1;
        else return 0;
      },
    },
    {
      title: 'Import Run Id',
      dataIndex: 'importRunId',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
      render: importRunId => <CopyIdToClipboard id={importRunId} />,
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
      title: 'Status',
      dataIndex: 'status',
      width: '12%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.status != nextRecord.status,
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.goLiveDate && b.goLiveDate)
          return moment(a.goLiveDate).unix() - moment(b.goLiveDate).unix();
        else if (a.goLiveDate) return -1;
        else if (b.goLiveDate) return 1;
        else return 0;
      },
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
            onClick={() => viewProduct(index, record)}
          >
            <EyeOutlined />
          </Link>
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

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    if (!details) {
      scrollToCenter(lastViewedIndex);
    }
  }, [details]);

  const viewProduct = (index: number, record?: Product) => {
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
    if (loaded.current) {
      products[lastViewedIndex] = record;
      setProducts([...products]);
    } else {
      setProducts([record]);
    }
  };

  const onSaveProduct = (product: Product) => {
    refreshItem(product);
    setCurrentProduct(product);
    setDetails(false);
  };

  const onCancelProduct = () => {
    setDetails(false);
  };

  const Filters = () => {
    return (
      <>
        <Col lg={16} xs={24}>
          <Row gutter={[8, 8]}>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Product Name</Typography.Title>
              <Input
                ref={inputRef}
                onChange={event => setSearchFilter(event.target.value)}
                suffix={<SearchOutlined />}
                value={searchFilter}
                placeholder="Search by Name"
                onPressEnter={() => getProducts(true)}
              />
            </Col>
            <Col lg={6} xs={24}>
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
            <Col lg={6} xs={24}>
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
                loading={isFetchingProductBrand}
                disabled={isFetchingProductBrand}
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
              <Typography.Title level={5}>Super Category</Typography.Title>
              <SimpleSelect
                data={allCategories['Super Category'].filter(item => {
                  return (
                    item.superCategory === 'Women' ||
                    item.superCategory === 'Men' ||
                    item.superCategory === 'Children'
                  );
                })}
                onChange={(_, category) =>
                  setProductSuperCategoryFilter(category)
                }
                style={{ width: '100%' }}
                selectedOption={productSuperCategoryFilter?.id}
                optionMapping={productSuperCategoryOptionMapping}
                placeholder={'Select a Super Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories}
                allowClear={true}
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Category</Typography.Title>
              <SimpleSelect
                data={allCategories.Category}
                onChange={(_, category) => setProductCategoryFilter(category)}
                style={{ width: '100%' }}
                selectedOption={productCategoryFilter?.id}
                optionMapping={productCategoryOptionMapping}
                placeholder={'Select a Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories}
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
                optionMapping={productSubCategoryOptionMapping}
                placeholder={'Select a Sub Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories}
                allowClear={true}
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Sub Sub Category</Typography.Title>
              <SimpleSelect
                data={allCategories['Sub Sub Category']}
                onChange={(_, category) =>
                  setProductSubSubCategoryFilter(category)
                }
                style={{ width: '100%' }}
                selectedOption={productSubSubCategoryFilter?.id}
                optionMapping={productSubSubCategoryOptionMapping}
                placeholder={'Select a Sub Sub Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories}
                allowClear={true}
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
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
            <Col lg={6} xs={24}>
              <Checkbox
                onChange={handleFilterOutOfStock}
                className={isMobile ? 'mt-1 mb-2' : 'mt-2 mb-1 ml-05'}
              >
                Out of Stock only
              </Checkbox>
            </Col>
          </Row>
        </Col>
      </>
    );
  };

  const collapse = (event?: any) => {
    if (event && isMobile) {
      if (activeKey === '1') setActiveKey('0');
    }
  };

  return (
    <>
      {!details && (
        <>
          <PageHeader
            title="Products"
            subTitle={isMobile ? '' : 'List of Live Products'}
            className={isMobile ? 'mb-n1' : ''}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box"
          >
            {!isMobile && <Filters />}
            {isMobile && (
              <Collapse
                ghost
                accordion
                activeKey={activeKey}
                onChange={() => {
                  if (activeKey === '0') setActiveKey('1');
                  else setActiveKey('0');
                }}
                destroyInactivePanel
              >
                <Panel
                  header={<Typography.Title level={5}>Filter</Typography.Title>}
                  key="1"
                >
                  <Filters />
                </Panel>
              </Collapse>
            )}
            <Col span={24}>
              <Row justify="space-between" align="top">
                <Col flex="auto">
                  <Button
                    type="text"
                    onClick={collapse}
                    style={{
                      display: activeKey === '1' ? 'block' : 'none',
                      background: 'none',
                    }}
                  >
                    <UpOutlined />
                  </Button>
                </Col>
                <Col className="mt-n2">
                  <Button
                    type="primary"
                    onClick={() => getProducts(true)}
                    loading={loading}
                    style={{
                      position: 'relative',
                      top: activeKey === '1' ? '2rem' : '3.5rem',
                    }}
                    className="mr-1"
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <ProductAPITestModal
            selectedRecord={productAPITest}
            setSelectedRecord={setProductAPITest}
          />
          <InfiniteScroll
            dataLength={products.length}
            next={getProducts}
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
              loading={!products.length && loading}
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
        <ProductDetail
          brands={brands}
          productBrands={productBrands}
          allCategories={allCategories}
          onSave={onSaveProduct}
          onCancel={onCancelProduct}
          product={currentProduct}
          productBrand={currentProductBrand}
          brand={currentMasterBrand}
          isFetchingBrands={isFetchingBrands}
          isFetchingProductBrand={isFetchingProductBrand}
          isLive
        />
      )}
    </>
  );
};

export default LiveProducts;
