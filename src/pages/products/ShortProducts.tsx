/* eslint-disable react-hooks/exhaustive-deps */
import {
  ArrowRightOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  UpOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Collapse,
  Input,
  message,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Tooltip,
  Typography,
} from 'antd';
import EditableTable, { EditableColumnType } from 'components/EditableTable';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Product } from 'interfaces/Product';
import moment from 'moment';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  deleteStagingProduct,
  exportToShopifyProduct,
  fetchBrands,
  fetchProductBrands,
  fetchStagingProducts,
  saveStagingProduct,
  transferStageProduct,
} from 'services/DiscoClubService';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import './Products.scss';
import { AppContext } from 'contexts/AppContext';
import { ProductBrand } from 'interfaces/ProductBrand';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import SimpleSelect from '../../components/select/SimpleSelect';
import { SelectOption } from '../../interfaces/SelectOption';
import ProductDetail from './ProductDetail';
import useAllCategories from 'hooks/useAllCategories';

const { Panel } = Collapse;

const ShortProducts: React.FC<RouteComponentProps> = () => {
  const inputRef = useRef<any>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const loaded = useRef<boolean>(false);
  const [loadingResources, setLoadingResources] = useState<boolean>(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProduct, setCurrentProduct] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);

  const { usePageFilter } = useContext(AppContext);
  const [searchFilter, setSearchFilter] = usePageFilter<string>('search');
  const [brandFilter, setBrandFilter] = useState<Brand | undefined>();
  const [productBrandFilter, setProductBrandFilter] = useState<
    ProductBrand | undefined
  >();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [currentMasterBrand, setCurrentMasterBrand] = useState<string>();
  const [currentProductBrand, setCurrentProductBrand] = useState<string>();
  const [style, setStyle] = useState<any>();
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [activeKey, setActiveKey] = useState<string>('1');
  const [btnStyle, setBtnStyle] = useState<any>();
  const history = useHistory();
  const cloning = useRef<boolean>(false);
  const { fetchAllCategories, allCategories } = useAllCategories({});

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    if (details || (isMobile && activeKey === '1'))
      setStyle({ overflow: 'scroll', height: '100%' });
    else setStyle({ overflow: 'clip', height: '100%' });
  }, [details, isMobile, activeKey]);

  useEffect(() => {
    if (isMobile)
      setBtnStyle({ position: 'fixed', top: '17rem', right: '3.5rem' });
    else setBtnStyle({ position: 'fixed', top: '25.5rem', left: '15rem' });
  }, [isMobile]);

  useEffect(() => {
    if (inputRef.current && searchFilter) {
      if (selectionEnd.current === searchFilter.length || !inputFocused.current)
        inputRef.current.focus({
          cursor: 'end',
        });
      else {
        const title = document.getElementById('title') as HTMLInputElement;
        inputRef.current.focus();
        title!.setSelectionRange(selectionEnd.current!, selectionEnd.current!);
      }
    }
  }, [searchFilter]);

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
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
  const inputFocused = useRef<boolean>(false);
  const selectionEnd = useRef<number>();

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

  const _fetchStagingProducts = async (resetResults?: boolean) => {
    if (resetResults) scrollToCenter(0);
    const pageToUse = resetResults ? 0 : page;
    const response = await doFetch(() =>
      fetchStagingProducts({
        limit: 30,
        page: pageToUse,
        brandId: brandFilter?.id,
        query: searchFilter,
        unclassified: undefined,
        productBrandId: productBrandFilter?.id,
        outOfStock: undefined,
        status: undefined,
        superCategoryId: undefined,
        categoryId: undefined,
        subCategoryId: undefined,
        subSubCategoryId: undefined,
        runId: undefined,
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

  const refreshItem = (record: Product) => {
    products[lastViewedIndex] = record;
    setProducts([...products]);
  };

  const onSaveItem = async (record: Product) => {
    await doRequest(() => saveStagingProduct(record));
    await getProducts(true);
  };

  const handleStage = async (productId: string) => {
    await doRequest(() => transferStageProduct(productId), 'Product commited.');
    await getProducts(true);
  };

  const handleUploadToShopify = async (productId: string) => {
    const response: any = await doRequest(
      () => exportToShopifyProduct(productId),
      '',
      true
    );
    if (response.success) message.success(response.message);
    else message.error('Error: ' + response.error);
    await getProducts(true);
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
            <Tooltip title="ID">ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyValueToClipboard tooltipText="Copy ID" value={id} />,
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
      width: '10%',
      render: (value: string, record: Product, index: number) => (
        <>
          <Link
            onClick={() => handleEdit(record, index)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            {value}
          </Link>
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
            <Tooltip title="Client">Client</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['brand', 'brandName'],
      width: '10%',
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
            <Tooltip title="Last Import">Last Import</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'lastImportDate',
      width: '10%',
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
      width: '10%',
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
            <Tooltip title="Clone">Clone</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      align: 'center',
      render: (_, record: Product, index: number) => (
        <>
          <Link
            onClick={() => handleEdit(record, index, true)}
            to={{ pathname: window.location.pathname, state: record }}
          >
            <CopyOutlined />
          </Link>
        </>
      ),
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
      width: '15%',
      align: 'right',
      render: (_, record: Product, index: number) => (
        <>
          <Link
            onClick={() => handleEdit(record, index)}
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
          <Button
            onClick={() => handleUploadToShopify(record.id)}
            type="link"
            style={{ color: 'red', padding: 0, margin: 6 }}
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
    setCurrentProduct(undefined);
    setCurrentMasterBrand(undefined);
    setCurrentProductBrand(undefined);
    setLastViewedIndex(index);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleEdit = (
    product: Product,
    productIndex: number,
    isCloning?: boolean
  ) => {
    if (isCloning) {
      cloning.current = true;
      setCurrentProduct({ ...product, id: undefined as unknown as string });
    } else setCurrentProduct(product);

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
    setDetails(true);
    history.push(window.location.pathname);
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

    setIsScrollable(details);
  }, [details]);

  const handleSave = (product: Product) => {
    refreshItem(product);
    setCurrentProduct(product);
    setDetails(false);
    if (cloning.current) cloning.current = false;
  };

  const handleCancel = () => {
    setDetails(false);
    if (cloning.current) cloning.current = false;
  };

  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  const handleTitleFilterChange = (event: any) => {
    setSearchFilter(event.target.value);
    const selectionStart = event.target.selectionStart;
    selectionEnd.current = event.target.selectionEnd;
    if (selectionStart && selectionEnd) inputFocused.current = true;
  };

  const Filters = () => {
    return (
      <>
        <Row gutter={[8, 8]} align="bottom">
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Product Name</Typography.Title>
            <Input
              allowClear
              id="title"
              disabled={loadingResources}
              ref={inputRef}
              onChange={event => handleTitleFilterChange(event)}
              suffix={<SearchOutlined />}
              value={searchFilter}
              placeholder="Search by Name"
              onPressEnter={() => getProducts(true)}
            />
          </Col>
          <Col lg={6} xs={24}>
            <Typography.Title level={5}>Client</Typography.Title>
            <SimpleSelect
              showSearch
              data={brands}
              onChange={(_, brand) => onChangeBrand(brand)}
              style={{ width: '100%' }}
              selectedOption={brandFilter?.brandName}
              optionMapping={optionMapping}
              placeholder="Select a Client"
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
            title="Short Products"
            subTitle={isMobile ? '' : 'Short Product List'}
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
                  <Button
                    key="2"
                    className={isMobile ? 'mt-05' : ''}
                    onClick={() => createProduct(products.length)}
                  >
                    New Item
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
                loading={loading}
                onSave={onSaveItem}
                pagination={false}
                rowSelection={{
                  selectedRowKeys,
                  onChange: onSelectChange,
                }}
                btnStyle={btnStyle}
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
          onSave={handleSave}
          onCancel={handleCancel}
          product={currentProduct}
          productBrand={currentProductBrand}
          brand={currentMasterBrand}
          loadingResources={loadingResources}
          isLive={false}
        />
      )}
    </div>
  );
};

export default ShortProducts;
