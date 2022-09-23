import {
  ArrowRightOutlined,
  SearchOutlined,
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
  Typography,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { EditableColumnType } from 'components/EditableTable';
import useAllCategories from 'hooks/useAllCategories';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Product } from 'interfaces/Product';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  fetchBrands,
  fetchProductBrands,
  fetchStagingProducts,
} from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import '../../pages/products/Products.scss';
import { ProductCategory } from 'interfaces/Category';
import { AppContext } from 'contexts/AppContext';
import { ProductBrand } from 'interfaces/ProductBrand';
import { useMount } from 'react-use';
import SimpleSelect from '../../components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import VariantGroupDetail from './VariantGroupDetail';
import scrollIntoView from 'scroll-into-view';
const { Panel } = Collapse;

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

const VariantGroups: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { isMobile } = useContext(AppContext);
  const { doFetch } = useRequest({ setLoading });
  const [currentGroup, setCurrentGroup] = useState<Product>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [loadingResources, setLoadingResources] = useState<boolean>(true);
  const { fetchAllCategories, allCategories } = useAllCategories({});
  const loaded = useRef<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
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
  const [products, setProducts] = useState<Product[]>([]);
  const [productStatusFilter, setProductStatusFilter] =
    useState<string>('live');

  const [currentSuperCategory, setCurrentSuperCategory] =
    useState<ProductCategory>();
  const [currentCategory, setCurrentCategory] = useState<ProductCategory>();
  const [currentSubCategory, setCurrentSubCategory] =
    useState<ProductCategory>();
  const [currentSubSubCategory, setCurrentSubSubCategory] =
    useState<ProductCategory>();

  const [activeKey, setActiveKey] = useState<string>('-1');

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
    ]).then(() => setLoadingResources(false));
  });

  const handleFilterClassified = (e: CheckboxChangeEvent) => {
    setUnclassifiedFilter(e.target.checked);
  };

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
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
    if (resetResults) collapse(resetResults);
    if (!resetResults && !products.length) return;
    const { results } = await doFetch(() =>
      _fetchStagingProducts(resetResults)
    );
    if (resetResults) setProducts(results);
    else setProducts(prev => [...prev.concat(results)]);
    if (!loaded.current) loaded.current = true;
  };

  const handleEdit = (product: Product) => {
    setCurrentGroup(product);
    setDetails(true);
  };

  const handleFilterOutOfStock = (e: CheckboxChangeEvent) => {
    setOutOfStockFilter(e.target.checked);
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: 'VariantId',
      dataIndex: 'id',
      width: '5%',
      render: id => <CopyValueToClipboard value={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      width: '85%',
      align: 'left',
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Edit Group',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record: Product) => (
        <>
          <Button
            onClick={() => handleEdit(record)}
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
              disabled={loadingResources || loading}
              value={searchFilter}
              onChange={event => setSearchFilter(event.target.value)}
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
              onChange={(_, productBrand) => onChangeProductBrand(productBrand)}
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
              <Select.Option value="live">Live</Select.Option>
              <Select.Option value="paused">Paused</Select.Option>
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
              disabled={loadingResources || loading}
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
              disabled={loadingResources || loading}
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
                loading ||
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
                loading ||
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
              disabled={loadingResources || loading}
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
    <>
      {!details && (
        <>
          <PageHeader
            title="Variant Groups"
            subTitle={isMobile ? '' : 'Select group to edit'}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box mb-05"
            id="filterPanel"
            style={panelStyle}
          >
            <Col lg={16} xs={24}>
              {!isMobile && <Filters />}
              {isMobile && (
                <>
                  <Collapse
                    ghost
                    activeKey={activeKey}
                    onChange={handleCollapseChange}
                    destroyInactivePanel
                  >
                    <Panel
                      header={
                        <Typography.Title level={5}>Filters</Typography.Title>
                      }
                      key="1"
                    >
                      <Filters />
                    </Panel>
                  </Collapse>
                </>
              )}
            </Col>
            <Col>
              <Row justify="space-between" align="bottom">
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
                    onClick={() => getProducts(true)}
                    loading={loading}
                    className="mr-1"
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
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
            <Table
              scroll={{ x: true }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={products}
              loading={loading}
              pagination={false}
            />
          </InfiniteScroll>
        </>
      )}
      {details && (
        <VariantGroupDetail
          variantGroup={currentGroup as Product}
          variantList={products}
          searchPage={page}
          brands={brands}
          productBrands={productBrands}
          setDetails={setDetails}
        />
      )}
    </>
  );
};

export default VariantGroups;
