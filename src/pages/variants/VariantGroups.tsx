import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
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
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import '../../pages/products/Products.scss';
import { ProductCategory } from 'interfaces/Category';
import { AppContext } from 'contexts/AppContext';
import { ProductBrand } from 'interfaces/ProductBrand';
import { useMount } from 'react-use';
import SimpleSelect from '../../components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import VariantGroupDetail from './VariantGroupDetail';
const { Panel } = Collapse;

const VariantGroups: React.FC<RouteComponentProps> = () => {
  const [currentGroup, setCurrentGroup] = useState<Product>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { fetchAllCategories, allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });
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

  const { doFetch } = useRequest({ setLoading });

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
    if (loaded.current) {
      setPage(0);
      setEof(false);
      getProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter]);

  const handleFilterClassified = (e: CheckboxChangeEvent) => {
    setUnclassifiedFilter(e.target.checked);
  };

  const _fetchStagingProducts = async (resetResults?: boolean) => {
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
      render: id => <CopyIdToClipboard id={id} />,
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

  const Filters = () => {
    return (
      <>
        <Row
          align="bottom"
          justify={isMobile ? 'end' : 'space-between'}
          className="pt-0"
        >
          <Col lg={16} xs={24}>
            <Row gutter={[8, 8]}>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Product Name</Typography.Title>
                <Input
                  value={searchFilter}
                  onChange={event => setSearchFilter(event.target.value)}
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
                  loading={isFetchingProductBrands}
                  disabled={isFetchingProductBrands}
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
              <Col lg={6} xs={24}>
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
                  className={isMobile ? 'mt-1 mb-1' : 'mt-2 mb-1 ml-05'}
                >
                  Out of Stock only
                </Checkbox>
              </Col>
              <Col lg={6} xs={24}>
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
                    onClick={() => getProducts(true)}
                    loading={loading}
                    className="mb-1"
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
            title="Variant Groups"
            subTitle={isMobile ? '' : 'Select group to edit'}
            className={isMobile ? 'mb-n1' : ''}
          />
          {!isMobile && <Filters />}
          {isMobile && (
            <>
              <Collapse ghost className="sticky-filter-box">
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
          <Row justify="end">
            <Col>
              <Button
                type="primary"
                onClick={() => getProducts(true)}
                loading={loading}
                className="mb-1 mr-1"
              >
                Search
                <SearchOutlined style={{ color: 'white' }} />
              </Button>
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
              className="mt-2"
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
