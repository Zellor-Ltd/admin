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
  Table,
  Typography,
} from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import 'pages/products/Products.scss';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { EditableColumnType } from 'components/EditableTable';
import { AppContext } from 'contexts/AppContext';
import useAllCategories from 'hooks/useAllCategories';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Product } from 'interfaces/Product';
import moment from 'moment';
import {
  fetchBrands,
  fetchProductBrands,
  fetchProductTemplates,
} from 'services/DiscoClubService';
import ProductAPITestModal from 'pages/products/ProductAPITestModal';
import ProductExpandedRow from 'pages/products/ProductExpandedRow';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ProductBrand } from 'interfaces/ProductBrand';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import { ProductCategory } from 'interfaces/Category';
import ProductTemplateDetail from './ProductTemplateDetail';

const { Panel } = Collapse;

const ProductTemplates: React.FC<RouteComponentProps> = () => {
  const { isMobile } = useContext(AppContext);
  const inputRef = useRef<any>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrand, setIsFetchingProductBrand] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });
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
  const [outOfStockFilter, setOutOfStockFilter] = useState<boolean>();
  const [currentMasterBrand, setCurrentMasterBrand] = useState<string>();
  const [currentProductBrand, setCurrentProductBrand] = useState<string>();
  const loaded = useRef<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTemplate, setCurrentTemplate] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [productTemplates, setProductTemplates] = useState<Product[]>([]);
  const [productStatusFilter, setProductTemplateStatusFilter] =
    useState<string>();
  const [runIdFilter, setRunIdFilter] = useState<string>();

  const [superCategoryFilter, setSuperCategoryFilter] =
    useState<ProductCategory>();
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory>();
  const [subCategoryFilter, setSubCategoryFilter] = useState<ProductCategory>();
  const [subSubCategoryFilter, setSubSubCategoryFilter] =
    useState<ProductCategory>();

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const superCategoryOptionMapping: SelectOption = {
    key: 'id',
    label: 'superCategory',
    value: 'id',
  };

  const categoryOptionMapping: SelectOption = {
    key: 'id',
    label: 'category',
    value: 'id',
  };

  const subCategoryOptionMapping: SelectOption = {
    key: 'id',
    label: 'subCategory',
    value: 'id',
  };

  const subSubCategoryOptionMapping: SelectOption = {
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

  const _fetchProductTemplates = async () => {
    scrollToCenter(0);
    const response = await doFetch(() =>
      fetchProductTemplates({
        brandId: brandFilter?.id,
        query: searchFilter,
        productBrandId: productBrandFilter?.id,
        outOfStock: outOfStockFilter,
        status: productStatusFilter,
        superCategoryId: superCategoryFilter?.id,
        categoryId: categoryFilter?.id,
        subCategoryId: subCategoryFilter?.id,
        subSubCategoryId: subSubCategoryFilter?.id,
        runId: runIdFilter,
      })
    );
    return response;
  };

  const getProductTemplates = async (resetResults?: boolean) => {
    if (resetResults) collapse(resetResults);
    if (!resetResults && !productTemplates.length) return;
    const { results } = await doFetch(() => _fetchProductTemplates());
    if (resetResults) {
      setProductTemplates(results);
    } else setProductTemplates(prev => [...prev.concat(results)]);
    if (!loaded.current) loaded.current = true;
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
            onClick={() => viewProductTemplate(index, record)}
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
            onClick={() => viewProductTemplate(index, record)}
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
      const product = productTemplates.find(
        product => product.id === productId
      );
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

  const viewProductTemplate = (index: number, record?: Product) => {
    setCurrentTemplate(record);
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
      productTemplates[lastViewedIndex] = record;
      setProductTemplates([...productTemplates]);
    } else {
      setProductTemplates([record]);
    }
  };

  const onSaveTemplate = (productTemplate: Product) => {
    refreshItem(productTemplate);
    setCurrentTemplate(productTemplate);
    setDetails(false);
  };

  const onCancelTemplate = () => {
    setDetails(false);
  };

  const Filters = () => {
    return (
      <>
        <Col lg={16} xs={24}>
          <Row gutter={[8, 8]}>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Template Name</Typography.Title>
              <Input
                disabled={loading}
                ref={inputRef}
                onChange={event => setSearchFilter(event.target.value)}
                suffix={<SearchOutlined />}
                value={searchFilter}
                placeholder="Search by Name"
                onPressEnter={() => getProductTemplates(true)}
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
                disabled={isFetchingBrands || loading}
                allowClear
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
                disabled={isFetchingProductBrand || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Status</Typography.Title>
              <Select
                disabled={loading}
                placeholder="Select a Status"
                style={{ width: '100%' }}
                onChange={(value: string) =>
                  setProductTemplateStatusFilter(value)
                }
                allowClear
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
                onChange={(_, category) => setSuperCategoryFilter(category)}
                style={{ width: '100%' }}
                selectedOption={superCategoryFilter?.id}
                optionMapping={superCategoryOptionMapping}
                placeholder={'Select a Super Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Category</Typography.Title>
              <SimpleSelect
                data={allCategories.Category}
                onChange={(_, category) => setCategoryFilter(category)}
                style={{ width: '100%' }}
                selectedOption={categoryFilter?.id}
                optionMapping={categoryOptionMapping}
                placeholder={'Select a Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Sub Category</Typography.Title>
              <SimpleSelect
                data={allCategories['Sub Category']}
                onChange={(_, category) => setSubCategoryFilter(category)}
                style={{ width: '100%' }}
                selectedOption={subCategoryFilter?.id}
                optionMapping={subCategoryOptionMapping}
                placeholder={'Select a Sub Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Sub Sub Category</Typography.Title>
              <SimpleSelect
                data={allCategories['Sub Sub Category']}
                onChange={(_, category) => setSubSubCategoryFilter(category)}
                style={{ width: '100%' }}
                selectedOption={subSubCategoryFilter?.id}
                optionMapping={subSubCategoryOptionMapping}
                placeholder={'Select a Sub Sub Category'}
                loading={fetchingCategories}
                disabled={fetchingCategories || loading}
                allowClear
              ></SimpleSelect>
            </Col>
            <Col lg={6} xs={24}>
              <Typography.Title level={5}>Run ID</Typography.Title>
              <Input
                disabled={loading}
                onChange={evt => {
                  setRunIdFilter(evt.target.value);
                }}
                value={runIdFilter}
                suffix={<SearchOutlined />}
                placeholder="Search by Run ID"
                onPressEnter={() => getProductTemplates(true)}
              />
            </Col>
            <Col lg={6} xs={24}>
              <Checkbox
                disabled={loading}
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

  const collapse = (shouldCollapse?: any) => {
    if (shouldCollapse && isMobile) {
      if (activeKey === '1') setActiveKey('0');
    }
  };

  const handleCollapseChange = () => {
    if (activeKey === '1') setActiveKey('0');
    else setActiveKey('1');
  };

  const createProductTemplate = (index: number) => {
    setCurrentTemplate(undefined);
    setCurrentMasterBrand(undefined);
    setCurrentProductBrand(undefined);
    setLastViewedIndex(index);
    setDetails(true);
  };

  return (
    <>
      {!details && (
        <>
          <PageHeader
            title="Product Templates"
            subTitle={isMobile ? '' : 'List of Product Templates'}
            extra={[
              <Row justify="end" key="headerRow">
                <Col>
                  <Row gutter={8}>
                    <Col>
                      <Button
                        style={{ display: 'none' }}
                        key="2"
                        className={isMobile ? 'mt-05' : ''}
                        onClick={() =>
                          createProductTemplate(productTemplates.length)
                        }
                      >
                        New Item
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
                accordion
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
              className={activeKey === '1' ? 'mt-n1 mb-1' : 'mt-n1'}
            >
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
                <Col>
                  <Button
                    type="primary"
                    onClick={() => getProductTemplates(true)}
                    loading={loading}
                    style={{
                      position: 'relative',
                      top: activeKey === '1' ? '0' : '0.5rem',
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
          <Table
            scroll={{ x: true }}
            className="mt-2"
            rowClassName={(_, index) =>
              `scrollable-row-${index} ${
                index === lastViewedIndex ? 'selected-row' : ''
              }`
            }
            rowKey="id"
            columns={columns}
            dataSource={productTemplates}
            loading={!productTemplates.length && loading}
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
        </>
      )}
      {details && (
        <ProductTemplateDetail
          brands={brands}
          productBrands={productBrands}
          allCategories={allCategories}
          onSave={onSaveTemplate}
          onCancel={onCancelTemplate}
          template={currentTemplate}
          productBrand={currentProductBrand}
          brand={currentMasterBrand}
          isFetchingBrands={isFetchingBrands}
          isFetchingProductBrand={isFetchingProductBrand}
        />
      )}
    </>
  );
};

export default ProductTemplates;
