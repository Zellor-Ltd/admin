/* eslint-disable react-hooks/exhaustive-deps */
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
  message,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { discoBrandId } from 'helpers/constants';
import { Brand } from 'interfaces/Brand';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import { deleteBrand, fetchBrands, saveBrand } from 'services/DiscoClubService';
import { SimpleSwitch } from '../../components/SimpleSwitch';
import BrandDetail from './BrandDetail';
import scrollIntoView from 'scroll-into-view';
import { useRequest } from 'hooks/useRequest';

const tagColorByStatus: any = {
  approved: 'green',
  rejected: 'red',
  pending: '',
};

const Brands: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [details, setDetails] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filterText, setFilterText] = useState('');
  const [currentBrand, setCurrentBrand] = useState<Brand>();
  const { isMobile } = useContext(AppContext);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const { results }: any = await doFetch(fetchBrands);
    setBrands(results);
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

  const aproveOrReject = async (aprove: boolean, creator: Brand) => {
    creator.status = aprove ? 'approved' : 'rejected';
    setLoading(true);
    await saveBrand(creator);
    fetch();
  };

  const deleteItem = async (id: string, index: number) => {
    setLoading(true);
    try {
      await deleteBrand({ id });
      setBrands(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const onChangeFilter = (evt: any) => {
    setFilterText(evt.target.value);
  };

  const filterBrand = () => {
    return brands.filter(brand =>
      brand.brandName?.toUpperCase().includes(filterText?.toUpperCase())
    );
  };

  const handleSwitchChange = async (
    switchType: 'showOutOfStock' | 'paused',
    brand: Brand,
    toggled: boolean
  ) => {
    try {
      brand[switchType] = toggled;
      await saveBrand(brand);
      message.success('Register updated with success.');
    } catch (error) {
      message.error("Error: Couldn't set brand property. Try again.");
    }
  };

  const editBrand = (index: number, brand?: Brand) => {
    setLastViewedIndex(index);
    setCurrentBrand(brand);
    setDetails(true);
  };

  const refreshItem = (record: Brand) => {
    brands[lastViewedIndex] = record;
    setBrands([...brands]);
  };

  const onSaveBrand = (record: Brand) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelBrand = () => {
    setDetails(false);
  };

  const columns: ColumnsType<Brand> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: (_, record: Brand) => <CopyValueToClipboard value={record.id} />,
      align: 'center',
    },
    {
      title: 'Master Brand Name',
      dataIndex: 'brandName',
      width: '30%',
      render: (value: string, record: Brand, index: number) => (
        <Link to={location.pathname} onClick={() => editBrand(index, record)}>
          {record.id !== discoBrandId ? (
            value
          ) : (
            <b style={{ color: 'lightcoral' }}>{value}</b>
          )}
        </Link>
      ),
      sorter: (a, b) => {
        if (a.brandName && b.brandName)
          return a.brandName.localeCompare(b.brandName);
        else if (a.brandName) return 1;
        else if (b.brandName) return -1;
        else return 0;
      },
    },
    {
      title: 'Paused',
      dataIndex: 'paused',
      width: '15%',
      align: 'center',
      render: (_: any, record: Brand) => (
        <SimpleSwitch
          toggled={!!record.paused}
          handleSwitchChange={(toggled: boolean) =>
            handleSwitchChange('paused', record, toggled)
          }
        />
      ),
      sorter: (a, b): any => {
        if (a.paused && b.paused) return 0;
        else if (a.paused) return -1;
        else if (b.paused) return 1;
        else return 0;
      },
    },
    {
      title: 'Show Out of Stock',
      dataIndex: 'showOutOfStock',
      width: '15%',
      align: 'center',
      render: (value: any, record: Brand) => (
        <SimpleSwitch
          toggled={!!record.showOutOfStock}
          handleSwitchChange={(toggled: boolean) =>
            handleSwitchChange('showOutOfStock', record, toggled)
          }
        />
      ),
      sorter: (a, b): any => {
        if (a.showOutOfStock && b.showOutOfStock) return 0;
        else if (a.showOutOfStock) return -1;
        else if (b.showOutOfStock) return 1;
        else return 0;
      },
    },
    {
      title: 'Automated',
      dataIndex: 'automated',
      width: '15%',
      align: 'center',
      render: (value: any) => <b>{value ? 'Yes' : 'No'}</b>,
      sorter: (a, b): any => {
        if (a.automated && b.automated) return 0;
        else if (a.automated) return -1;
        else if (b.automated) return 1;
        else return 0;
      },
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
      title: 'D%',
      dataIndex: 'discoPercentage',
      width: '10%',
      align: 'center',
      render: (value: string) => <a href=".">{value}</a>,
      sorter: (a, b): any => {
        if (a.discoPercentage && b.discoPercentage)
          return a.discoPercentage - b.discoPercentage;
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
          return a.creatorPercentage - b.creatorPercentage;
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
          return a.maxDiscoDollarPercentage - b.maxDiscoDollarPercentage;
        else if (a.maxDiscoDollarPercentage) return -1;
        else if (b.maxDiscoDollarPercentage) return 1;
        else return 0;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '20%',
      align: 'center',
      render: (value = 'pending') => (
        <Tag color={tagColorByStatus[value]}>{value}</Tag>
      ),
      sorter: (a, b): any => {
        if (a.status && b.status)
          return a.status === b.status ? 0 : a.status === 'pending' ? 1 : -1;
        else if (a.status) return -1;
        else if (b.status) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: Brand, index: number) => (
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
          <Link to={location.pathname} onClick={() => editBrand(index, record)}>
            <EditOutlined />
          </Link>
          {record.id !== discoBrandId && (
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
          )}
        </>
      ),
    },
  ];

  return (
    <>
      {!details && (
        <>
          <PageHeader
            title="Master Brands"
            subTitle={isMobile ? '' : 'List of Master Brands'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editBrand(filterBrand().length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="mb-1 sticky-filter-box">
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Search
              </Typography.Title>
              <Input
                allowClear
                disabled={loading}
                onChange={onChangeFilter}
                placeholder="Search by Name"
                suffix={<SearchOutlined />}
              />
            </Col>
          </Row>
          <Table
            scroll={{ x: true }}
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={filterBrand()}
            loading={loading}
            pagination={false}
          />
        </>
      )}
      {details && (
        <BrandDetail
          onSave={onSaveBrand}
          onCancel={onCancelBrand}
          brand={currentBrand as Brand}
        />
      )}
    </>
  );
};

export default Brands;
