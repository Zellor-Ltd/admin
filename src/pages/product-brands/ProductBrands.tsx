import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
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
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [filter, setFilter] = useState<string>();

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
    if (!productBrands.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = productBrands.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setProductBrands(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setProductBrands([]);
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

      if (search(productBrands).length < 10) setEof(true);
    }
  }, [details, productBrands]);

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
      sorter: (a, b): any => {
        if (a.externalCode && b.externalCode)
          return a.externalCode !== b.externalCode
            ? a.externalCode - b.externalCode
            : 0;
        else if (a.externalCode) return -1;
        else if (b.externalCode) return 1;
        else return 0;
      },
    },
    {
      title: 'D%',
      dataIndex: 'discoPercentage',
      width: '10%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,

      sorter: (a, b): any => {
        if (a.discoPercentage && b.discoPercentage)
          return a.discoPercentage !== b.discoPercentage
            ? a.discoPercentage - b.discoPercentage
            : 0;
        else if (a.discoPercentage) return -1;
        else if (b.discoPercentage) return 1;
        else return 0;
      },
    },
    {
      title: 'C%',
      dataIndex: 'creatorPercentage',
      width: '10%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,
      sorter: (a, b): any => {
        if (a.creatorPercentage && b.creatorPercentage)
          return a.creatorPercentage !== b.creatorPercentage
            ? a.creatorPercentage - b.creatorPercentage
            : 0;
        else if (a.creatorPercentage) return -1;
        else if (b.creatorPercentage) return 1;
        else return 0;
      },
    },

    {
      title: 'DD%',
      dataIndex: 'maxDiscoDollarPercentage',
      width: '10%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,
      sorter: (a, b): any => {
        if (a.maxDiscoDollarPercentage && b.maxDiscoDollarPercentage)
          return a.maxDiscoDollarPercentage !== b.maxDiscoDollarPercentage
            ? a.maxDiscoDollarPercentage - b.maxDiscoDollarPercentage
            : 0;
        else if (a.maxDiscoDollarPercentage) return -1;
        else if (b.maxDiscoDollarPercentage) return 1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.brandName && b.brandName)
          return a.brandName.localeCompare(b.brandName);
        else if (a.brandName) return -1;
        else if (b.brandName) return 1;
        else return 0;
      },
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
      sorter: (a, b): any => {
        if (a.hCreationDate && b.hCreationDate)
          return (
            moment(a.hCreationDate as Date).unix() -
            moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
      },
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

  const search = rows => {
    return rows.filter(
      row => row.brandName.toLowerCase().indexOf(filter ?? '') > -1
    );
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
    productBrands[lastViewedIndex] = record;
    setProductBrands([...productBrands]);
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
                onClick={() => editProductBrand(productBrands.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row className="sticky-filter-box" gutter={8}>
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                placeholder="Search by Name"
                className="mb-1"
                value={filter}
                suffix={<SearchOutlined />}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={productBrands.length}
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
              dataSource={search(productBrands)}
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
