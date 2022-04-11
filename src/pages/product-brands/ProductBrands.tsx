import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Row, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from '../../components/SearchFilter';
import useFilter from '../../hooks/useFilter';
import { useRequest } from '../../hooks/useRequest';
import { ProductBrand } from '../../interfaces/ProductBrand';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  fetchProductBrands,
  deleteProductBrand,
} from '../../services/DiscoClubService';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import ProductBrandDetail from './ProductBrandDetail';
import scrollIntoView from 'scroll-into-view';
import InfiniteScroll from 'react-infinite-scroll-component';

const ProductBrands: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProductBrand, setCurrentProductBrand] =
    useState<ProductBrand>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filteredProductBrands, setFilteredProductBrands] = useState<
    ProductBrand[]
  >([]);

  const {
    setArrayList: setProductBrands,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<ProductBrand>([]);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getProductBrands();
  };

  const getProductBrands = async () => {
    const { results } = await doFetch(fetchProductBrands);
    setProductBrands(results);
    setRefreshing(true);
  };

  const fetchData = () => {
    if (!filteredContent.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredProductBrands(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredProductBrands([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const columns: ColumnsType<ProductBrand> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'External Code',
      dataIndex: 'externalCode',
      width: '10%',
      align: 'center',
    },
    {
      title: 'D%',
      dataIndex: 'discoPercentage',
      width: '10%',
      align: 'center',
      render: (value: string) => <a href="#">{value}</a>,
    },
    {
      title: 'C%',
      dataIndex: 'creatorPercentage',
      width: '10%',
      align: 'center',
      render: (value: string) => <a href="#">{value}</a>,
    },
    {
      title: 'DD%',
      dataIndex: 'maxDiscoDollarPercentage',
      width: '10%',
      align: 'center',
      render: (value: string) => <a href="#">{value}</a>,
    },
    {
      title: 'Name',
      dataIndex: 'brandName',
      width: '20%',
      render: (value: string, record: ProductBrand, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editProductBrand(index, record)}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: ProductBrand, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editProductBrand(index, record)}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const searchFilterFunction = (filterText: string) => {
    if (!filterText) {
      removeFilterFunction('productBrandName');
      setRefreshing(true);
      return;
    }
    addFilterFunction('productBrandName', brands =>
      brands.filter(brand =>
        brand.brandName.toUpperCase().includes(filterText.toUpperCase())
      )
    );
    setRefreshing(true);
  };

  const editProductBrand = (index: number, productBrand?: ProductBrand) => {
    setLastViewedIndex(index);
    setCurrentProductBrand(productBrand);
    setDetails(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deleteProductBrand(id));
    setProductBrands(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const refreshItem = (record: ProductBrand) => {
    filteredProductBrands[lastViewedIndex] = record;
    setProductBrands([...filteredProductBrands]);
  };

  const onSaveBrand = (record: ProductBrand) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelBrand = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Product Brands"
            subTitle="List of Product Brands"
            extra={[
              <Button
                key="1"
                onClick={() => editProductBrand(filteredProductBrands.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row className="sticky-filter-box" gutter={8}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by Product Brand Name"
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={filteredProductBrands.length}
            next={fetchData}
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
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={filteredProductBrands}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <ProductBrandDetail
          productBrand={currentProductBrand as ProductBrand}
          onSave={onSaveBrand}
          onCancel={onCancelBrand}
        />
      )}
    </>
  );
};

export default ProductBrands;
