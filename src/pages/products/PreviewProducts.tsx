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
  Tooltip,
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
  barcodeLookup,
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
  const [loading, setLoading] = useState<boolean>(false);
  const loaded = useRef<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [loadingResources, setLoadingResources] = useState<boolean>(true);
  const { fetchAllCategories, allCategories } = useAllCategories({});

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);

  const { usePageFilter } = useContext(AppContext);
  const [barcodeFilter, setBarcodeFilter] = useState<string>();
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
  const [style, setStyle] = useState<any>();
  const { isMobile, setisScrollable } = useContext(AppContext);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const { doRequest: saveCategories, loading: loadingCategories } =
    useRequest();
  const [activeKey, setActiveKey] = useState<string>('1');

  useEffect(() => {
    if (details || (isMobile && activeKey === '1'))
      setStyle({ overflow: 'scroll', height: '100%' });
    else setStyle({ overflow: 'clip', height: '100%' });
  }, [details, isMobile, activeKey]);

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

  const [offset, setOffset] = useState<number>(64);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: 64,
    marginBottom: '0.5rem',
    zIndex: 3,
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
    setPanelStyle({ top: offset, zIndex: 3 });
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
      const { results }: any = await fetchProductBrands();
      setProductBrands(results);
    };

    const getBrands = async () => {
      const { results }: any = await fetchBrands();
      setBrands(results);
    };

    await Promise.all([
      getBrands(),
      getProductBrands(),
      fetchAllCategories(),
    ]).then(() => {
      setLoadingResources(false);
    });
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
    if (resetResults) scrollToCenter(0);
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
    loaded.current = true;
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyValueToClipboard value={id} />,
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Master Brand">Master Brand</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Import Run ID">Import Run ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'importRunId',
      width: '7%',
      align: 'center',
      responsive: ['sm'],
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Product Brand">Product Brand</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="SKU">SKU</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'sku',
      width: '5%',
      align: 'center',
    },
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="In Stock">In Stock</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Currency">Currency</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Price">Price</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Max DD">Max DD</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Last Import">Last Import</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Last Go-Live">Last Go-Live</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
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

  const createProduct = async (index: number) => {
    try {
      if (barcodeFilter) {
        const { results }: any = await barcodeLookup(barcodeFilter, null);
        setCurrentProduct(results?.[0]);
        setCurrentMasterBrand(results?.[0]?.brand?.brandName);
        setCurrentProductBrand(results?.[0]?.productBrand?.brandName);
      }
    } catch (error: any) {
      setCurrentProduct(undefined);
      setCurrentMasterBrand(undefined);
      setCurrentProductBrand(undefined);
    }
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

    setisScrollable(details);
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
            loadedRef={loaded}
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
            <div className="preview custom-table">
              <InfiniteScroll
                height="27rem"
                dataLength={products.length}
                next={getProducts}
                hasMore={!eof}
                loader={
                  page !== 0 &&
                  loading && (
                    <div className="scroll-message">
                      <Spin />
                    </div>
                  )
                }
                endMessage={
                  loaded.current && (
                    <div className="scroll-message">
                      <b>End of results.</b>
                    </div>
                  )
                }
              >
                <EditableTable
                  scroll={{ x: true }}
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
            </div>
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
              loadingResources={loadingResources}
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

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const Filters = () => {
    return (
      <>
        <Row gutter={[8, 8]} align="bottom">
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Product Name</Typography.Title>
            <Input
              allowClear
              disabled={loadingResources}
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
              showSearch
              data={brands}
              onChange={(_, brand) => onChangeBrand(brand)}
              style={{ width: '100%' }}
              selectedOption={brandFilter?.brandName}
              optionMapping={optionMapping}
              placeholder="Select a Master Brand"
              disabled={loadingResources}
              allowClear
            ></SimpleSelect>
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Product Brand</Typography.Title>
            <SimpleSelect
              showSearch
              data={productBrands}
              onChange={(_, productBrand) => onChangeProductBrand(productBrand)}
              style={{ width: '100%' }}
              selectedOption={productBrandFilter?.brandName}
              optionMapping={optionMapping}
              placeholder="Select a Product Brand"
              disabled={loadingResources}
              allowClear
            ></SimpleSelect>
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Status</Typography.Title>
            <Select
              disabled={loadingResources}
              placeholder="Select a Status"
              style={{ width: '100%' }}
              onChange={setProductStatusFilter}
              allowClear
              defaultValue={productStatusFilter}
              showSearch
              filterOption={filterOption}
            >
              <Select.Option value="live" label="live">
                Live
              </Select.Option>
              <Select.Option value="paused" label="paused">
                Paused
              </Select.Option>
            </Select>
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Super Category</Typography.Title>
            <SimpleSelect
              showSearch
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
              placeholder="Select a Super Category"
              disabled={loadingResources}
              allowClear
            ></SimpleSelect>
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Category</Typography.Title>
            <SimpleSelect
              showSearch
              data={allCategories.Category.filter(item => {
                return currentSuperCategory
                  ? item.superCategory === currentSuperCategory.superCategory
                  : true;
              })}
              onChange={(_, category) => setCurrentCategory(category)}
              style={{ width: '100%' }}
              selectedOption={currentCategory?.id ?? null}
              optionMapping={productCategoryOptionMapping}
              placeholder="Select a Category"
              disabled={loadingResources}
              allowClear
            ></SimpleSelect>
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Sub Category</Typography.Title>
            <SimpleSelect
              showSearch
              data={allCategories['Sub Category'].filter(item => {
                return (
                  (currentCategory
                    ? item.category === currentCategory.category
                    : true) &&
                  (currentSuperCategory
                    ? item.superCategory === currentSuperCategory.superCategory
                    : true)
                );
              })}
              onChange={(_, category) => setCurrentSubCategory(category)}
              style={{ width: '100%' }}
              selectedOption={currentSubCategory?.id ?? null}
              optionMapping={productSubCategoryOptionMapping}
              placeholder="Select a Sub Category"
              disabled={
                loadingResources ||
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
              allowClear
            ></SimpleSelect>
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Sub Sub Category</Typography.Title>
            <SimpleSelect
              showSearch
              data={allCategories['Sub Sub Category'].filter(item => {
                return (
                  (currentSubCategory
                    ? item.subCategory === currentSubCategory.subCategory
                    : true) &&
                  (currentCategory
                    ? item.category === currentCategory.category
                    : true) &&
                  (currentSuperCategory
                    ? item.superCategory === currentSuperCategory.superCategory
                    : true)
                );
              })}
              onChange={(_, category) => setCurrentSubSubCategory(category)}
              style={{ width: '100%' }}
              selectedOption={currentSubSubCategory?.id ?? null}
              optionMapping={productSubSubCategoryOptionMapping}
              placeholder="Select a Sub Sub Category"
              disabled={
                loadingResources ||
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
              allowClear
            ></SimpleSelect>
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Run ID</Typography.Title>
            <Input
              allowClear
              disabled={loadingResources}
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
              disabled={loadingResources}
              onChange={handleFilterOutOfStock}
              className={isMobile ? 'mt-1 mb-1' : 'mt-2 mb-05'}
            >
              <div style={{ display: 'grid', placeItems: 'stretch' }}>
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  Out of Stock only
                </div>
              </div>
            </Checkbox>
          </Col>
          <Col lg={6} xs={24}>
            <Checkbox
              disabled={loadingResources}
              onChange={handleFilterClassified}
              className={isMobile ? 'mb-2' : 'mt-2 mb-05'}
            >
              <div style={{ display: 'grid', placeItems: 'stretch' }}>
                <div
                  style={{
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  Unclassified only
                </div>
              </div>
            </Checkbox>
          </Col>
        </Row>
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
    <div style={style}>
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
            className={isMobile ? 'mb-1 w-100' : ''}
            extra={[
              <Row
                gutter={8}
                justify="end"
                align="bottom"
                key="headerRow"
                style={{ margin: 0 }}
              >
                <Col>
                  <Input
                    allowClear
                    disabled={loadingResources}
                    onChange={event => setBarcodeFilter(event.target.value)}
                    suffix={<SearchOutlined />}
                    value={barcodeFilter}
                    placeholder="Lookup Barcode"
                    onPressEnter={() => createProduct(products.length)}
                  />
                </Col>
                <Col>
                  <Button
                    key="2"
                    className={isMobile ? 'mt-05' : ''}
                    onClick={() => createProduct(products.length)}
                  >
                    New Item
                  </Button>
                </Col>
                <Col style={{ paddingRight: 0 }}>
                  <Button
                    key="3"
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
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box"
            id="filterPanel"
            style={panelStyle}
          >
            <Col lg={16} xs={{ flex: 'auto' }}>
              {!isMobile && <Filters />}
              {isMobile && (
                <Collapse
                  ghost
                  activeKey={activeKey}
                  onChange={handleCollapseChange}
                  destroyInactivePanel
                >
                  <Panel
                    header={
                      activeKey === '1' ? (
                        <Typography.Title level={5}>
                          Click to Collapse
                        </Typography.Title>
                      ) : (
                        <Typography.Title level={5}>Filter</Typography.Title>
                      )
                    }
                    key="1"
                  >
                    <Filters />
                  </Panel>
                </Collapse>
              )}
            </Col>
            <Col
              xs={{ flex: 'none' }}
              className={activeKey === '1' ? 'mt-n1 mb-1' : ''}
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
                      display: isMobile && activeKey === '1' ? 'block' : 'none',
                      background: 'none',
                    }}
                  >
                    <UpOutlined />
                  </Button>
                </Col>
                <Col>
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
                    className="ml-1 mr-05"
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
    </div>
  );
};

export default PreviewProducts;
