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

const ProductBrands: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentProductBrand, setCurrentProductBrand] =
    useState<ProductBrand>();
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);

  const handleResize = () => {
    if (window.innerWidth < 991) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

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
  };

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
      row => row.brandName.toUpperCase().indexOf(filter.toUpperCase()) > -1
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
            subTitle={isMobile ? '' : 'List of Product Brands'}
            className={isMobile ? 'mb-n1' : ''}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editProductBrand(productBrands.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row className="sticky-filter-box mb-1" gutter={8}>
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                placeholder="Search by Name"
                value={filter}
                suffix={<SearchOutlined />}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <Table
            scroll={{ x: true }}
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={search(productBrands)}
            loading={loading}
          />
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
