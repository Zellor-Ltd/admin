/* eslint-disable react-hooks/exhaustive-deps */
import {
  CloseOutlined,
  MenuOutlined,
  PlusOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Collapse,
  Input,
  List,
  PageHeader,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
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
import {
  fetchVariants,
  addVariant,
  deleteVariant,
  fetchStagingProducts,
} from 'services/DiscoClubService';
import '../../pages/products/Products.scss';
import { ProductCategory } from 'interfaces/Category';
import { AppContext } from 'contexts/AppContext';
import { ProductBrand } from 'interfaces/ProductBrand';
import SimpleSelect from '../../components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import scrollIntoView from 'scroll-into-view';
const { Panel } = Collapse;
interface VariantGroupDetailProps {
  variantGroup: Product;
  variantList: Product[];
  searchPage: number;
  brands: Brand[];
  productBrands: ProductBrand[];
  setDetails: (boolean) => void;
  onSave?: (record: Product) => void;
  onCancel?: () => void;
  superCategories: any[];
  categories: any[];
  subCategories: any[];
  subSubCategories: any[];
  setDetailsActiveKey: any;
}

const VariantGroupDetail: React.FC<VariantGroupDetailProps> = ({
  variantGroup,
  variantList,
  searchPage,
  brands,
  productBrands,
  setDetails,
  superCategories,
  categories,
  subCategories,
  subSubCategories,
  setDetailsActiveKey,
}) => {
  const [showMore, setShowMore] = useState<boolean>(false);
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const { allCategories } = useAllCategories({
    setLoading: setFetchingCategories,
  });
  const { usePageFilter } = useContext(AppContext);
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [runIdFilter, setRunIdFilter] = useState<string>();
  const [brandFilter, setBrandFilter] = useState<Brand | undefined>();
  const [productBrandFilter, setProductBrandFilter] = useState<
    ProductBrand | undefined
  >();
  const [outOfStockFilter, setOutOfStockFilter] = useState<boolean>(false);
  const [unclassifiedFilter, setUnclassifiedFilter] = useState<boolean>(false);
  const [page, setPage] = useState<number>(searchPage);
  const [eof, setEof] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>(variantList);
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
  const [loaded, setLoaded] = useState<boolean>(false);
  const [style, setStyle] = useState<any>();
  const { isMobile } = useContext(AppContext);

  useEffect(() => {
    if (isMobile)
      setStyle({
        fontSize: '16px',
        lineHeight: 1.5,
        position: 'relative',
        left: '-.1rem',
      });
    else
      setStyle({
        fontSize: '16px',
        lineHeight: 1.5,
        position: 'relative',
        left: '.8rem',
      });
  }, [isMobile]);

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
    zIndex: 3,
  });
  const filterPanelHeight = useRef<number>();
  const windowHeight = window.innerHeight;

  useEffect(() => {
    setDetailsActiveKey(activeKey);
  }, [activeKey]);

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
    setPanelStyle({ zIndex: 3, top: offset });
  }, [offset]);

  useEffect(() => {
    getGroupItems();
  }, []);

  const getGroupItems = async () => {
    const { results } = await doFetch(() => fetchVariants(variantGroup.id));
    if (!results.find(item => item.id === variantGroup.id))
      setVariants([variantGroup, ...results]);
    else setVariants(results);
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

  useEffect(() => {
    setPage(0);
    setEof(false);
    getProducts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchFilter]);

  const handleFilterClassified = (e: CheckboxChangeEvent) => {
    setUnclassifiedFilter(e.target.checked);
  };

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
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
    if (resetResults) collapse(resetResults);
    if (!resetResults && !products.length) return;
    const { results } = await doFetch(() =>
      _fetchStagingProducts(resetResults)
    );
    if (resetResults) setProducts(results);
    else setProducts(prev => [...prev.concat(results)]);
    setLoaded(true);
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
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
      render: (_, record: Product) => (
        <>
          <Button
            disabled={record.variantId === variantGroup.id}
            onClick={() => handleAdd(record)}
            type="link"
            style={
              record.variantId === variantGroup.id
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

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const Filters = () => {
    return (
      <>
        <Row
          align="bottom"
          justify={isMobile ? 'end' : 'space-between'}
          className={isMobile ? 'pt-0' : 'ml-25 pt-0'}
        >
          <Col lg={20} xs={24}>
            <Row gutter={[8, 8]}>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Product Name</Typography.Title>
                <Input
                  allowClear
                  value={searchFilter}
                  onChange={event => setSearchFilter(event.target.value)}
                  placeholder="Search by Name"
                  onPressEnter={() => getProducts(true)}
                  disabled={fetchingCategories}
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
                  allowClear
                  disabled={fetchingCategories}
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
                  allowClear
                  disabled={fetchingCategories}
                ></SimpleSelect>
              </Col>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Status</Typography.Title>
                <Select
                  placeholder="Select a Status"
                  style={{ width: '100%' }}
                  onChange={setProductStatusFilter}
                  allowClear
                  showSearch
                  filterOption={filterOption}
                  defaultValue={productStatusFilter}
                  disabled={fetchingCategories}
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
                  data={superCategories}
                  onChange={(_, category) => setCurrentSuperCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentSuperCategory?.id}
                  optionMapping={productSuperCategoryOptionMapping}
                  placeholder="Select a Super Category"
                  loading={fetchingCategories}
                  disabled={fetchingCategories}
                  allowClear
                ></SimpleSelect>
              </Col>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Category</Typography.Title>
                <SimpleSelect
                  showSearch
                  data={categories}
                  onChange={(_, category) => setCurrentCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentCategory?.id ?? null}
                  optionMapping={productCategoryOptionMapping}
                  placeholder="Select a Category"
                  loading={fetchingCategories}
                  disabled={fetchingCategories}
                  allowClear
                ></SimpleSelect>
              </Col>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Sub Category</Typography.Title>
                <SimpleSelect
                  showSearch
                  data={subCategories}
                  onChange={(_, category) => setCurrentSubCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentSubCategory?.id ?? null}
                  optionMapping={productSubCategoryOptionMapping}
                  placeholder="Select a Sub Category"
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
                  allowClear
                ></SimpleSelect>
              </Col>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Sub Sub Category</Typography.Title>
                <SimpleSelect
                  showSearch
                  data={subSubCategories}
                  onChange={(_, category) => setCurrentSubSubCategory(category)}
                  style={{ width: '100%' }}
                  selectedOption={currentSubSubCategory?.id ?? null}
                  optionMapping={productSubSubCategoryOptionMapping}
                  placeholder="Select a Sub Sub Category"
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
                  allowClear
                ></SimpleSelect>
              </Col>
              <Col lg={6} xs={24}>
                <Typography.Title level={5}>Run ID</Typography.Title>
                <Input
                  allowClear
                  onChange={evt => {
                    setRunIdFilter(evt.target.value);
                  }}
                  value={runIdFilter}
                  suffix={<SearchOutlined />}
                  placeholder="Search by Run ID"
                  onPressEnter={() => getProducts(true)}
                  disabled={fetchingCategories}
                />
              </Col>
              <Col lg={6} xs={24}>
                <Checkbox
                  onChange={handleFilterOutOfStock}
                  className={isMobile ? 'mt-1 mb-1' : 'mt-2 mb-1 ml-05'}
                  disabled={fetchingCategories}
                >
                  Out of Stock only
                </Checkbox>
              </Col>
              <Col lg={6} xs={24}>
                <Checkbox
                  onChange={handleFilterClassified}
                  className={isMobile ? 'mb-2' : 'mt-2 mb-1 ml-05'}
                  disabled={fetchingCategories}
                >
                  Unclassified only
                </Checkbox>
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  };

  const handleRemove = async (item: Product) => {
    await doRequest(() => deleteVariant(item.id, variantGroup.id));
    setVariants(prev => [
      ...prev.slice(0, variants.indexOf(item)),
      ...prev.slice(variants.indexOf(item) + 1),
    ]);
  };

  const handleAdd = async (item: Product) => {
    await doRequest(() => addVariant(item.id, variantGroup.id));
    setVariants([...variants, item]);
  };

  const collapse = (shouldCollapse?: any) => {
    if (shouldCollapse && isMobile && activeKey === '1') setActiveKey('0');
  };

  const handleCollapseChange = () => {
    if (isMobile && activeKey === '1') setActiveKey('0');
    else setActiveKey('1');
  };

  return (
    <>
      <PageHeader
        title={`Editing ${variantGroup.name}`}
        subTitle={isMobile ? '' : 'Add/Remove Variants'}
        className={isMobile ? 'mb-n1' : ''}
        extra={
          <Row justify="end">
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
          className="ml-1 mt-1 mb-05"
          showArrow={false}
          header={
            <Typography.Title level={5}>
              &nbsp;&nbsp;&nbsp;&nbsp;
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
                      onClick={() => handleRemove(item)}
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
        className="ml-1 mb-1"
      >
        <Typography.Title level={5} style={style}>
          <PlusOutlined />
          &nbsp;&nbsp;&nbsp;&nbsp;Add Variants
        </Typography.Title>
      </Button>
      {showMore && (
        <>
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box"
            id="filterPanel"
            style={panelStyle}
          >
            {!isMobile && <Filters />}
            {
              <div
                style={isMobile ? { display: 'block' } : { display: 'none' }}
              >
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
              </div>
            }
            <Col span={24}>
              <Row justify="space-between" align="top">
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
                    type="primary"
                    onClick={() => getProducts(true)}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="empty custom-table">
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
                loaded && (
                  <div className="scroll-message">
                    <b>End of results.</b>
                  </div>
                )
              }
            >
              <Table
                scroll={{ x: true, y: '24.5rem' }}
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={columns}
                dataSource={products}
                loading={loading}
                pagination={false}
              />
            </InfiniteScroll>
          </div>
        </>
      )}
    </>
  );
};

export default VariantGroupDetail;
