import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { discoBrandId } from 'helpers/constants';
import { Brand } from 'interfaces/Brand';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { deleteBrand, fetchBrands, saveBrand } from 'services/DiscoClubService';
import { PauseSwitch } from './PauseSwitch';

const tagColorByStatus: any = {
  approved: 'green',
  rejected: 'red',
  pending: '',
};

const Brands: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/brand`;
  const [loading, setLoading] = useState<boolean>(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterText, setFilterText] = useState('');
  const [content, setContent] = useState<any[]>([]);

  const aproveOrReject = async (aprove: boolean, creator: Brand) => {
    creator.status = aprove ? 'approved' : 'rejected';
    setLoading(true);
    await saveBrand(creator);
    fetch();
  };

  const deleteItem = async (id: string) => {
    setLoading(true);
    try {
      await deleteBrand({ id });
      for (let i = 0; i < content.length; i++) {
        if (content[i].id === id) {
          const index = i;
          setBrands(prev => [
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
          ]);
        }
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const fetch = async () => {
    setLoading(true);
    const response: any = await fetchBrands();
    setLoading(false);
    setBrands(response.results);
    setContent(response.results);
  };

  useEffect(() => {
    fetch();
  }, []);

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterBrand = () => {
    return brands.filter(brand =>
      brand.brandName?.toUpperCase().includes(filterText.toUpperCase())
    );
  };

  const columns: ColumnsType<Brand> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Master Brand Name',
      dataIndex: 'brandName',
      width: '30%',
      render: (value: string, record: Brand) => (
        <Link to={{ pathname: detailsPathname, state: record }}>
          {record.id !== discoBrandId ? (
            value
          ) : (
            <b style={{ color: 'lightcoral' }}>{value}</b>
          )}
        </Link>
      ),
    },
    {
      title: 'Paused',
      dataIndex: 'paused',
      width: '15%',
      align: 'center',
      render: (value: any, record: Brand) => (
        <PauseSwitch brand={record} reloadFn={fetch} />
      ),
    },
    {
      title: 'Automated',
      dataIndex: 'automated',
      width: '15%',
      align: 'center',
      render: (value: any) => <b>{value ? 'Yes' : 'No'}</b>,
    },
    {
      title: ' Master Brand Color',
      dataIndex: 'brandTxtColor',
      width: '20%',
      align: 'center',
      render: (value: any) => (
        <Avatar
          style={{ backgroundColor: value, border: '1px solid #9c9c9c' }}
        />
      ),
    },
    {
      title: 'Disco %',
      dataIndex: 'discoPercentage',
      width: '12%',
      align: 'center',
      responsive: ['sm'],
      // editable: true,
      // number: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '20%',
      align: 'center',
      render: (value = 'pending') => (
        <Tag color={tagColorByStatus[value]}>{value}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: Brand) => (
        <>
          {!record.status && [
            <CheckOutlined
              key="approve"
              style={{ color: 'green' }}
              onClick={() => aproveOrReject(true, record)}
            />,
            <CloseOutlined
              key="reject"
              style={{ color: 'red', margin: '6px' }}
              onClick={() => aproveOrReject(false, record)}
            />,
          ]}
          <Link to={{ pathname: detailsPathname, state: record }}>
            <EditOutlined />
          </Link>
          {record.id !== discoBrandId && (
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
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Master Brands"
        subTitle="List of Master Brands"
        extra={[
          <Button key="1" onClick={() => history.push(detailsPathname)}>
            New Item
          </Button>,
        ]}
      />
      <div style={{ marginBottom: '16px' }}>
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={5} title="Search">
              Search
            </Typography.Title>
            <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
          </Col>
        </Row>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filterBrand()}
        loading={loading}
      />
    </>
  );
};

export default Brands;
