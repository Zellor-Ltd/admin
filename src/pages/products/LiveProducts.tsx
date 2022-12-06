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
  Input,
  PageHeader,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import './Products.scss';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import { EditableColumnType } from 'components/EditableTable';
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
} from 'services/DiscoClubService';
import ProductAPITestModal from './ProductAPITestModal';
import ProductExpandedRow from './ProductExpandedRow';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ProductBrand } from 'interfaces/ProductBrand';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import ProductDetail from './ProductDetail';
import { ProductCategory } from 'interfaces/Category';

const { Panel } = Collapse;

const LiveProducts: React.FC<RouteComponentProps> = () => {
  const { isMobile, setisScrollable } = useContext(AppContext);
  const inputRef = useRef<any>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingResources, setLoadingResources] = useState<boolean>(false);
  const { fetchAllCategories, allCategories } = useAllCategories({});
  const { usePageFilter } = useContext(AppContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [productAPITest, setProductAPITest] = useState<Product | null>(null);
  const { doFetch } = useRequest({ setLoading });
  const { loading: loadingCategories } = useRequest();
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [brandFilter, setBrandFilter] = useState<Brand | undefined>();
  const [productBrandFilter, setProductBrandFilter] = useState<
    ProductBrand | undefined
  >();
  const [outOfStockFilter, setOutOfStockFilter] = useState<boolean>(false);
  const [currentMasterBrand, setCurrentMasterBrand] = useState<string>();
  const [currentProductBrand, setCurrentProductBrand] = useState<string>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(true);
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
  const [activeKey, setActiveKey] = useState<string>('1');

  const [offset, setOffset] = useState<number>(64);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({
    top: 64,
    marginBottom: '0.5rem',
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

  const handleFilterOutOfStock = (e: CheckboxChangeEvent) => {
    setOutOfStockFilter(e.target.checked);
  };

  useMount(async () => {
    const getBrands = async () => {
      setLoading(true);
      const response: any = await fetchBrands();
      setLoading(false);
      setBrands(response.results);
    };

    const getProductBrands = async () => {
      const { results }: any = await fetchProductBrands();
      setProductBrands(results);
    };

    await Promise.all([
      getBrands(),
      getProductBrands(),
      fetchAllCategories(),
    ]).then(() => setLoadingResources(false));
  });

  useEffect(() => {
    if (inputRef.current)
      inputRef.current.focus({
        cursor: 'end',
      });
  }, [searchFilter]);

  const _fetchProducts = async (resetResults?: boolean) => {
    if (resetResults) scrollToCenter(0);
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
    if (!resetResults && products.length < 30) {
      setEof(true);
      return;
    }
    if (resetResults) {
      setEof(false);
      collapse(resetResults);
    }
    const { results } = await doFetch(() => _fetchProducts(resetResults));
    if (resetResults) setProducts(results);
    else setProducts(prev => [...prev.concat(results)]);
    if (!loaded.current) loaded.current = true;
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
      width: '1%',
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
      width: '5%',
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Disco %">Disco %</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'discoPercentage',
      width: '5%',
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Shopify ID">Shopify ID</Tooltip>
          </div>
        </div>
      ),
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
      width: '4%',
      align: 'center',
      responsive: ['sm'],
      render: importRunId => <CopyValueToClipboard value={importRunId} />,
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
            <Tooltip title="Expiration Date">Expiration Date</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Status">Status</Tooltip>
          </div>
        </div>
      ),
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

    setisScrollable(details);
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

  const filterOption = (input: string, option: any) => {
    return !!option?.label
      ?.toString()
      ?.toUpperCase()
      .includes(input?.toUpperCase());
  };

  const Filters = () => {
    return (
      <>
        <Col lg={16} xs={24}>
          <Row gutter={[8, 8]} align="bottom">
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Product Name</Typography.Title>
              <Input
                allowClear
                disabled={loadingResources || loading}
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
                disabled={loadingResources || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Product Brand</Typography.Title>
              <SimpleSelect
                showSearch
                data={productBrands}
                onChange={(_, productBrand) =>
                  onChangeProductBrand(productBrand)
                }
                style={{ width: '100%' }}
                selectedOption={productBrandFilter?.brandName}
                optionMapping={optionMapping}
                placeholder="Select a Product Brand"
                disabled={loadingResources || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Status</Typography.Title>
              <Select
                disabled={loadingResources || loading}
                placeholder="Select a Status"
                style={{ width: '100%' }}
                onChange={setProductStatusFilter}
                allowClear
                showSearch
                filterOption={filterOption}
                defaultValue={productStatusFilter}
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
                onChange={(_, category) =>
                  setProductSuperCategoryFilter(category)
                }
                style={{ width: '100%' }}
                selectedOption={productSuperCategoryFilter?.id}
                optionMapping={productSuperCategoryOptionMapping}
                placeholder="Select a Super Category"
                disabled={loadingResources || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Category</Typography.Title>
              <SimpleSelect
                showSearch
                data={allCategories.Category}
                onChange={(_, category) => setProductCategoryFilter(category)}
                style={{ width: '100%' }}
                selectedOption={productCategoryFilter?.id}
                optionMapping={productCategoryOptionMapping}
                placeholder="Select a Category"
                disabled={loadingResources || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Sub Category</Typography.Title>
              <SimpleSelect
                showSearch
                data={allCategories['Sub Category']}
                onChange={(_, category) =>
                  setProductSubCategoryFilter(category)
                }
                style={{ width: '100%' }}
                selectedOption={productSubCategoryFilter?.id}
                optionMapping={productSubCategoryOptionMapping}
                placeholder="Select a Sub Category"
                disabled={loadingResources || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Sub Sub Category</Typography.Title>
              <SimpleSelect
                showSearch
                data={allCategories['Sub Sub Category']}
                onChange={(_, category) =>
                  setProductSubSubCategoryFilter(category)
                }
                style={{ width: '100%' }}
                selectedOption={productSubSubCategoryFilter?.id}
                optionMapping={productSubSubCategoryOptionMapping}
                placeholder="Select a Sub Sub Category"
                disabled={loadingResources || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Run ID</Typography.Title>
              <Input
                allowClear
                disabled={loadingResources || loading}
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
                disabled={loadingResources || loading}
                onChange={handleFilterOutOfStock}
                className={isMobile ? 'mt-1 mb-2' : 'mt-2 mb-05'}
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
    <div
      style={
        details
          ? { height: '100%' }
          : activeKey === '1'
          ? { overflow: 'scroll', height: '100%' }
          : { overflow: 'clip', height: '100%' }
      }
    >
      {!details && (
        <>
          <PageHeader
            title="Products"
            subTitle={isMobile ? '' : 'List of Live Products'}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box mb-05"
            id="filterPanel"
            style={panelStyle}
          >
            {!isMobile && <Filters />}
            {isMobile && (
              <Collapse
                ghost
                accordion
                activeKey={activeKey}
                onChange={handleCollapseChange}
                destroyInactivePanel
                className="mb-n1"
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
            <Col className={activeKey === '1' ? 'mb-1' : ''}>
              <Row justify="space-between" align="top">
                <Col span={24}>
                  <Row justify="start">
                    <Col>
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
                  </Row>
                </Col>
                <Col flex="none">
                  <Row justify={activeKey === '1' ? 'end' : undefined}>
                    <Col>
                      <Button
                        type="primary"
                        onClick={() => getProducts(true)}
                        loading={loading}
                        className="mr-1"
                        style={{
                          position: 'relative',
                          top: activeKey !== '1' && isMobile ? '1rem' : 0,
                          width: '100%',
                        }}
                      >
                        Search
                        <SearchOutlined style={{ color: 'white' }} />
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
          <ProductAPITestModal
            selectedRecord={productAPITest}
            setSelectedRecord={setProductAPITest}
          />
          <div className="empty custom-table">
            <InfiniteScroll
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
              <Table
                className="mt-1"
                scroll={{ x: true, y: '27em' }}
                rowClassName={(_, index) =>
                  `scrollable-row-${index} ${
                    index === lastViewedIndex ? 'selected-row' : ''
                  }`
                }
                rowKey="id"
                columns={columns}
                dataSource={products}
                loading={!products.length && loading && page === 0}
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
                      loading={loadingCategories}
                      isStaging={false}
                      productBrands={productBrands}
                    ></ProductExpandedRow>
                  ),
                }}
              />
            </InfiniteScroll>
          </div>
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
          loadingResources={loadingResources}
          isLive
        />
      )}
    </div>
  );
};

export default LiveProducts;
