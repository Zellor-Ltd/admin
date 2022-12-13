/* eslint-disable eqeqeq */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  EyeOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Button, Col, PageHeader, Row, Table, Tooltip } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import 'pages/products/Products.scss';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
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
import { ProductBrand } from 'interfaces/ProductBrand';
import scrollIntoView from 'scroll-into-view';
import { useMount } from 'react-use';
import ProductDetail from 'pages/products/ProductDetail';

const ProductTemplates: React.FC<RouteComponentProps> = () => {
  const { isMobile, setisScrollable } = useContext(AppContext);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingResources, setLoadingResources] = useState<boolean>(true);
  const { fetchAllCategories, allCategories } = useAllCategories({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [productAPITest, setProductAPITest] = useState<Product | null>(null);
  const { doFetch } = useRequest({ setLoading });
  const { loading: loadingCategories } = useRequest();
  const [currentMasterBrand, setCurrentMasterBrand] = useState<string>();
  const [currentProductBrand, setCurrentProductBrand] = useState<string>();
  const loaded = useRef<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [currentTemplate, setCurrentTemplate] = useState<Product>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [productTemplates, setProductTemplates] = useState<Product[]>([]);
  const [style, setStyle] = useState<any>();

  useEffect(() => {
    if (!details) setStyle({ overflow: 'clip', height: '100%' });
    else setStyle({ overflow: 'scroll', height: '100%' });
  }, [details]);

  useMount(async () => {
    const getBrands = async () => {
      const response: any = await doFetch(() => fetchBrands());
      setBrands(response.results);
    };

    const getProductBrands = async () => {
      const { results }: any = await doFetch(() => fetchProductBrands());
      setProductBrands(results);
    };

    await Promise.all([
      getBrands(),
      getProductBrands(),
      fetchAllCategories(),
    ]).then(() => setLoadingResources(false));
  });

  const _fetchProductTemplates = async () => {
    scrollToCenter(0);
    const response = await doFetch(() => fetchProductTemplates());
    return response;
  };

  const getProductTemplates = async (resetResults?: boolean) => {
    if (!resetResults && !productTemplates.length) return;
    const { results } = await doFetch(() => _fetchProductTemplates());
    if (resetResults) {
      setProductTemplates(results);
    } else setProductTemplates(prev => [...prev.concat(results)]);
    if (!loaded.current) loaded.current = true;
  };

  const columns: EditableColumnType<Product>[] = [
    {
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch', width: '.5rem' }}>
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
      width: '5%',
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
            onClick={() => viewProductTemplate(index, record)}
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
      width: '10%',
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
      width: '10%',
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
      width: '10%',
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
      width: '10%',
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
      width: '10%',
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
      width: '10%',
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

    setisScrollable(details);
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

  const createProductTemplate = (index: number) => {
    setCurrentTemplate(undefined);
    setCurrentMasterBrand(undefined);
    setCurrentProductBrand(undefined);
    setLastViewedIndex(index);
    setDetails(true);
  };

  return (
    <div style={style}>
      {!details && (
        <>
          <PageHeader
            title="Product Templates"
            subTitle={isMobile ? '' : 'List of Product Templates'}
            extra={[
              <Row
                justify="end"
                key="headerRow"
                className={isMobile ? 'mt-05' : ''}
              >
                <Col>
                  <Row gutter={8}>
                    <Col>
                      <Button
                        style={{ display: 'none' }}
                        key="2"
                        onClick={() =>
                          createProductTemplate(productTemplates.length)
                        }
                      >
                        New Item
                      </Button>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        onClick={() => getProductTemplates(true)}
                        loading={loading}
                      >
                        Search
                        <SearchOutlined style={{ color: 'white' }} />
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>,
            ]}
          />
          <ProductAPITestModal
            selectedRecord={productAPITest}
            setSelectedRecord={setProductAPITest}
          />
          <div className="product-templates custom-table">
            <Table
              scroll={{ x: true, y: '27em' }}
              className="mt-1"
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
          </div>
        </>
      )}
      {details && (
        <ProductDetail
          brands={brands}
          productBrands={productBrands}
          allCategories={allCategories}
          onSave={onSaveTemplate}
          onCancel={onCancelTemplate}
          product={currentTemplate}
          productBrand={currentProductBrand}
          brand={currentMasterBrand}
          loadingResources={loadingResources}
          isLive={false}
          template
        />
      )}
    </div>
  );
};

export default ProductTemplates;
