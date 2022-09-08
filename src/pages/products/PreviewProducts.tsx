/* eslint-disable react-hooks/exhaustive-deps */
import {
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Collapse,
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
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  addVariant,
  deleteStagingProduct,
  fetchBrands,
  fetchProductBrands,
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from 'services/DiscoClubService';
import ProductExpandedRow from './ProductExpandedRow';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import './Products.scss';
import { ProductCategory } from 'interfaces/Category';
import { AppContext } from 'contexts/AppContext';
import { ProductBrand } from 'interfaces/ProductBrand';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import AlternatePreviewProducts from './AlternatePreviewProducts';
import SimpleSelect from '../../components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import ProductDetail from './ProductDetail';

const { Panel } = Collapse;

const PreviewProducts: React.FC<RouteComponentProps> = () => {
  const inputRef = useRef<any>(null);
  const [viewName, setViewName] = useState<'alternate' | 'default'>('default');
  const previousViewName = useRef<'alternate' | 'default'>('default');
  const saveProductFn = saveStagingProduct;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
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
  const [eof, setEof] = useState<boolean>(true);
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

  const [activeKey, setActiveKey] = useState<string>('-1');

  const [offset, setOffset] = useState<number>(64);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: 64,
  });
  const filterPanelHeight = useRef<number>();
  const windowHeight = window.innerHeight;

  useEffect(() => {
    const panel = document.getElementById('filterPanel');

    if (isMobile && panel) {
      // Code for Chrome, Safari and Opera
      panel.addEventListener('webkitTransitionEnd', updateOffset);
      // Standard syntax
      panel.addEventListener('transitionend', updateOffset);

      return () => {
        // Code for Chrome, Safari and Opera
        panel.removeEventListener('webkitTransitionEnd', updateOffset);
        // Standard syntax
        panel.removeEventListener('transitionend', updateOffset);
      };
    }
  });

  const updateOffset = () => {
    if (activeKey === '1') {
      filterPanelHeight.current =
        document.getElementById('filterPanel')!.offsetHeight;
      if (filterPanelHeight.current! > windowHeight) {
        const heightDifference = filterPanelHeight.current! - windowHeight;
        const seventhWindowHeight = windowHeight / 7;
        setOffset(-heightDifference - seventhWindowHeight);
      }
    } else setOffset(64);
  };

  useEffect(() => {
    setPanelStyle({ top: offset });
  }, [offset]);

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.focus({
        cursor: 'end',
      });
  }, [searchFilter]);

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

  const onAlternateViewSaveChanges = async (entity: Product) => {
    setDisabled(true);
    try {
      const response = (await saveProductFn(entity)) as any;
      refreshItem(response.result, 'alternate');

      message.success('Register updated with success.');
    } catch (error) {
      console.error(error);
    } finally {
      setDisabled(false);
    }
  };

  const handleFilterClassified = (e: CheckboxChangeEvent) => {
    setUnclassifiedFilter(e.target.checked);
  };

  const _fetchStagingProducts = async (resetResults?: boolean) => {
    scrollToCenter(0);
    const pageToUse = resetResults ? 0 : page;
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
    setPage(pageToUse + 1);

    if (response.results.length < 30) setEof(true);
    return response;
  };

  const getProducts = async (resetResults?: boolean) => {
    if (!resetResults && products.length < 30) {
      setEof(true);
      return;
    }
    if (resetResults) {
      setEof(false);
      collapse(resetResults);
    }
    const { results } = await doFetch(() =>
      _fetchStagingProducts(resetResults)
    );
    if (resetResults) setProducts(results);
    else setProducts(prev => [...prev.concat(results)]);
  };

  const deleteItem = async (_id: string, index: number) => {
    await doRequest(() => deleteStagingProduct(_id));
    setProducts(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const refreshItem = (record: Product, viewName?: 'default' | 'alternate') => {
    products[lastViewedIndex] = record;
    setProducts([...products]);
    setViewName(viewName ?? previousViewName.current);
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
      render: id => <CopyValueToClipboard value={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '15%',
      render: (value: string, record: Product, index: number) => (
        <>
          <Link
            onClick={() => editProduct(record, index, 'default')}
            to={{ pathname: window.location.pathname, state: record }}
          >
            {value}
          </Link>
          <span style={{ fontSize: '12px' }}>
            <br />
            {record.categories && record.categories.length
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

  const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
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
            onNextPage={getProducts}
            page={page}
            eof={eof}
            disabled={disabled}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            setSelectedRows={setSelectedRows}
          ></AlternatePreviewProducts>
        );
      case 'default':
        if (!details) {
          return (
            <>
              <InfiniteScroll
                dataLength={products.length}
                next={getProducts}
                hasMore={!eof}
                loader={
                  !eof && (
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
                  loading={loading || disabled}
                  onSave={onSaveItem}
                  pagination={false}
                  rowSelection={{
                    selectedRowKeys,
                    onChange: onSelectChange,
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
              isFetchingProductBrand={isFetchingProductBrands}
              isLive={false}
            />
          );
        }
      default:
        return <h1>Houston...</h1>;
    }
  };

  const handleGroupItems = () => {
    selectedRows.forEach(
      async item =>
        await doRequest(() => addVariant(item.id, selectedRowKeys[0]))
    );
  };

  const Filters = () => {
    return (
      <>
        <Col lg={16} xs={24}>
          <Row gutter={[8, 8]}>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Product Name</Typography.Title>
              <Input
                disabled={loading || disabled}
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
                disabled={isFetchingBrands || loading || disabled}
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
                loading={isFetchingProductBrands}
                disabled={isFetchingProductBrands || loading || disabled}
                allowClear={true}
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Status</Typography.Title>
              <Select
                disabled={loading || disabled}
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
                onChange={(_, category) => setCurrentSuperCategory(category)}
                style={{ width: '100%' }}
                selectedOption={currentSuperCategory?.id}
                optionMapping={productSuperCategoryOptionMapping}
                placeholder={'Select a Super Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories || loading || disabled}
                allowClear={true}
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Category</Typography.Title>
              <SimpleSelect
                data={allCategories.Category.filter(item => {
                  return currentSuperCategory
                    ? item.superCategory === currentSuperCategory.superCategory
                    : true;
                })}
                onChange={(_, category) => setCurrentCategory(category)}
                style={{ width: '100%' }}
                selectedOption={currentCategory?.id ?? null}
                optionMapping={productCategoryOptionMapping}
                placeholder={'Select a Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories || loading || disabled}
                allowClear={true}
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
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
                  loading ||
                  disabled ||
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
            <Col lg={6} xs={24}>
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
                  loading ||
                  disabled ||
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
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Run ID</Typography.Title>
              <Input
                disabled={loading || disabled}
                onChange={evt => {
                  setRunIdFilter(evt.target.value);
                }}
                value={runIdFilter}
                suffix={<SearchOutlined />}
                placeholder="Search by Run ID"
                onPressEnter={() => getProducts(true)}
              />
            </Col>
            <Col lg={6} xs={24}>
              <Checkbox
                disabled={loading || disabled}
                onChange={handleFilterOutOfStock}
                className={isMobile ? 'mt-1 mb-1' : 'mt-2 mb-1 ml-05'}
              >
                Out of Stock only
              </Checkbox>
            </Col>
            <Col lg={6} xs={24}>
              <Checkbox
                disabled={loading || disabled}
                onChange={handleFilterClassified}
                className={isMobile ? 'mb-2' : 'mt-2 mb-1 ml-05'}
              >
                Unclassified only
              </Checkbox>
            </Col>
          </Row>
        </Col>
      </>
    );
  };

  const collapse = (shouldCollapse?: any) => {
    if (shouldCollapse && isMobile) {
      if (activeKey === '1') setActiveKey('0');
    }
  };

  const handleCollapseChange = () => {
    if (activeKey === '1') setActiveKey('0');
    else setActiveKey('1');
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
            extra={[
              <Row justify="end" key="headerRow">
                <Col>
                  <Row gutter={8}>
                    <Col>
                      <Button
                        key="2"
                        className={isMobile ? 'mt-05' : ''}
                        onClick={() => createProduct(products.length)}
                      >
                        New Item
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        key="3"
                        type="primary"
                        className={isMobile ? 'mt-05' : ''}
                        onClick={switchView}
                      >
                        Switch View
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>,
            ]}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box"
            id="filterPanel"
            style={panelStyle}
          >
            {!isMobile && <Filters />}
            {isMobile && (
              <Collapse
                ghost
                activeKey={activeKey}
                onChange={handleCollapseChange}
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
            <Col
              span={24}
              className={activeKey === '1' ? 'mt-n1 mb-1' : 'mt-n05'}
            >
              <Row
                justify="space-between"
                align="top"
                style={{ background: 'white' }}
              >
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
                <Col
                  style={{
                    position: 'relative',
                    top: activeKey === '1' ? '0rem' : '0.5rem',
                  }}
                >
                  <Button
                    onClick={handleGroupItems}
                    loading={loading}
                    disabled={selectedRowKeys.length < 2}
                  >
                    Group
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => getProducts(true)}
                    loading={loading}
                    className="ml-1"
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
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
