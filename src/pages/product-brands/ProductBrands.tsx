import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Row, Table, Tag } from 'antd';
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

const tagColorByStatus: any = {
  approved: 'green',
  rejected: 'red',
  pending: '',
};

const ProductBrands: React.FC<RouteComponentProps> = ({
  history,
  location,
}) => {
  const detailsPathname = `${location.pathname}/product-brand`;
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [content, setContent] = useState<any[]>([]);

  const {
    setArrayList: setProductBrands,
    filteredArrayList: filteredProductBrands,
    addFilterFunction,
  } = useFilter<ProductBrand>([]);

  const getResources = async () => {
    await getProductBrands();
  };

  const getProductBrands = async () => {
    const { results } = await doFetch(fetchProductBrands);
    setProductBrands(results);
    setContent(results);
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteProductBrand(id));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === id) {
        const index = i;
        setProductBrands(prev => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
  };

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
      title: 'Name',
      dataIndex: 'brandName',
      width: '20%',
      render: (value: string, record: ProductBrand) => (
        <Link to={{ pathname: detailsPathname, state: record }}>{value}</Link>
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
      render: (_, record: ProductBrand) => (
        <>
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
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
    addFilterFunction('productBrandName', brands =>
      brands.filter(brand =>
        brand.brandName.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <div>
      <PageHeader
        title="Product Brands"
        subTitle="List of Product Brands"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <Row gutter={8}>
        <Col lg={8} xs={16}>
          <SearchFilter
            filterFunction={searchFilterFunction}
            label="Search by Product Brand Name"
          />
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredProductBrands}
        loading={loading}
      />
    </div>
  );
};

export default ProductBrands;
