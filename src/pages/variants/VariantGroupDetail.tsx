import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  List,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Select,
  Spin,
  Table,
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
  fetchVariants,
  addVariant,
  removeVariant,
  deleteStagingProduct,
  fetchBrands,
  fetchProductBrands,
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from 'services/DiscoClubService';
import ProductExpandedRow from '../../pages/products/ProductExpandedRow';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import '../../pages/products/Products.scss';
import { AllCategories, ProductCategory } from 'interfaces/Category';
import { SearchFilterDebounce } from 'components/SearchFilterDebounce';
import { AppContext } from 'contexts/AppContext';
import { ProductBrand } from 'interfaces/ProductBrand';
import { productUtils } from '../../helpers/product-utils';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import AlternatePreviewProducts from '../../pages/products/AlternatePreviewProducts';
import SimpleSelect from '../../components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import ProductsDetails from '../../pages/products/ProductsDetails';

const { getSearchTags, getCategories } = productUtils;
const { Panel } = Collapse;
interface VariantGroupDetailProps {
  variantGroup: Product;
  groups: Product[];
  brands: Brand[];
  productBrands: ProductBrand[];
  setDetails: (boolean) => void;
  onSave?: (record: Product) => void;
  onCancel?: () => void;
}

const VariantGroupDetail: React.FC<VariantGroupDetailProps> = ({
  variantGroup,
  brands,
  productBrands,
  setDetails,
}) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const [variants, setVariants] = useState<Product[]>([]);
  const [viewName, setViewName] = useState<'alternate' | 'default'>('default');
  const previousViewName = useRef<'alternate' | 'default'>('default');
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingProductBrands, setIsFetchingProductBrands] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
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
  const { doRequest: saveCategories } = useRequest();

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
    getGroupItems();
  }, []);

  const getGroupItems = async () => {
    const { results } = await doFetch(() => fetchVariants(variantGroup.id));
    setVariants(results);
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

  const updateDisplayedArray = async searchButton => {
    if (!products.length) return;
    const { results } = await _fetchStagingProducts(searchButton);
    setProducts(prev => [...prev.concat(results)]);
  };

  const handleFilterOutOfStock = (e: CheckboxChangeEvent) => {
    setOutOfStockFilter(e.target.checked);
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: '15%',
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '12%',
      align: 'right',
      render: (_, record: Product) => (
        <>
          <Button
            disabled={record.id === variantGroup.id}
            onClick={() => handleAdd(record.id)}
            type="link"
            style={
              record.id === variantGroup.id
                ? { color: 'gray' }
                : { color: 'green' }
            }
          >
            <PlusOutlined />
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
          className={isMobile ? 'pt-0' : 'ml-25 pt-0'}
        >
          <Col lg={16} xs={24}>
            <Row gutter={[8, 8]}>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Product Name</Typography.Title>
                <Input
                  value={searchFilter}
                  onChange={event => setSearchFilter(event.target.value)}
                  placeholder="Search by Name"
                  onPressEnter={() => getResources(true)}
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

  const handleRemove = async (itemId: string) => {
    await doRequest(() => removeVariant(itemId, variantGroup.id));
  };

  const handleAdd = async (itemId: string) => {
    await doRequest(() => addVariant(itemId, variantGroup.id));
  };

  return (
    <>
      <PageHeader
        title={`Editing ${variantGroup.name}`}
        subTitle={isMobile ? '' : 'Add/Remove Variants'}
        extra={
          <Row justify={isMobile ? 'end' : undefined}>
            <Col>
              <Button type="primary" onClick={() => setDetails(false)}>
                Go Back
              </Button>
            </Col>
          </Row>
        }
      />
      <Collapse ghost>
        <Panel
          showArrow={false}
          header={
            <Typography.Title level={5}>
              <MenuOutlined />
              &nbsp;&nbsp;&nbsp;&nbsp;Variants in Group
            </Typography.Title>
          }
          key="1"
        >
          <List
            itemLayout="vertical"
            dataSource={variants}
            renderItem={item => (
              <List.Item>
                <Row justify="space-between">
                  <Col>
                    <Typography.Text>{item.name}</Typography.Text>
                  </Col>
                  <Col>
                    <Button
                      disabled={item.id === variantGroup.id}
                      onClick={() => handleRemove(item.id)}
                      type="link"
                      style={
                        item.id === variantGroup.id
                          ? { color: 'grey' }
                          : { color: 'red' }
                      }
                    >
                      <CloseOutlined />
                    </Button>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Panel>
      </Collapse>
      <Button
        type="text"
        style={{ background: 'none' }}
        onClick={() => setShowMore(prev => !prev)}
        className="mb-1"
      >
        <Typography.Title
          level={5}
          style={{
            fontSize: '16px',
            lineHeight: 1.5,
            position: 'relative',
            left: '-4px',
          }}
        >
          <PlusOutlined />
          &nbsp;&nbsp;&nbsp;&nbsp;Add Variants
        </Typography.Title>
      </Button>
      {showMore && (
        <>
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
                onClick={getResources}
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
    </>
  );
};

export default VariantGroupDetail;
