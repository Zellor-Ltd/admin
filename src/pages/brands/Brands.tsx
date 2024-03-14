/* eslint-disable react-hooks/exhaustive-deps */
import {
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
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { discoBrandId } from 'helpers/constants';
import { Brand } from 'interfaces/Brand';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  deleteBrand,
  fetchBrands,
  loginAsClient,
} from 'services/DiscoClubService';
import BrandDetail from './BrandDetail';
import scrollIntoView from 'scroll-into-view';
import { useRequest } from 'hooks/useRequest';

const Brands: React.FC<RouteComponentProps> = ({ location }) => {
  const [details, setDetails] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandFilter, setBrandFilter] = useState();
  const [currentBrand, setCurrentBrand] = useState<Brand>();
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    if (!brandFilter) fetch();
  }, [brandFilter]);

  const fetch = async () => {
    const { results }: any = await doFetch(() =>
      fetchBrands({ name: brandFilter })
    );
    setBrands(results);
  };

  useEffect(() => {
    setIsScrollable(details);

    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const deleteItem = async (id: string, index: number) => {
    setLoading(true);
    try {
      await deleteBrand(id);
      setBrands(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const onChangeFilter = (evt: any) => {
    setBrandFilter(evt.target.value);
  };

  const editBrand = (index: number, brand?: Brand) => {
    setLastViewedIndex(index);
    setCurrentBrand(brand);
    setDetails(true);
    history.push(window.location.pathname);
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

  const loginAs = (id: string) => loginAsClient(id);

  const columns: ColumnsType<Brand> = [
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
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: (_, record: Brand) => (
        <CopyValueToClipboard tooltipText="Copy ID" value={record.id} />
      ),
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
            <Tooltip title="Client Name">Client Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '15%',
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
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return 1;
        else if (b.name) return -1;
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
            <Tooltip title="Client Email">Client Email</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'email',
      width: '15%',
      sorter: (a, b) => {
        if (a.email && b.email) return a.email.localeCompare(b.email);
        else if (a.email) return 1;
        else if (b.email) return -1;
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
            <Tooltip title="Shop Name">Shop Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'shopName',
      width: '15%',
      sorter: (a, b) => {
        if (a.shopName && b.shopName)
          return a.shopName.localeCompare(b.shopName);
        else if (a.shopName) return 1;
        else if (b.shopName) return -1;
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
            <Tooltip title="Shop URL">Shop URL</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'shopUrl',
      width: '15%',
      sorter: (a, b) => {
        if (a.shopUrl && b.shopUrl) return a.shopUrl.localeCompare(b.shopUrl);
        else if (a.shopUrl) return 1;
        else if (b.shopUrl) return -1;
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
            <Tooltip title="Client Color">Client Color</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'txtColor',
      width: '10%',
      align: 'center',
      render: (value: any) => (
        <Avatar
          style={{ backgroundColor: value, border: '1px solid #9c9c9c' }}
        />
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
            <Tooltip title="Login as">Login as</Tooltip>
          </div>
        </div>
      ),
      width: '10%',
      align: 'center',
      render: (_, record: Brand, index: number) => (
        <Button key={`item_${index}`} onClick={() => loginAs(record.id)}>
          Login as
        </Button>
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
      render: (_, record: Brand, index: number) => (
        <>
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
        <div style={{ overflow: 'clip', height: '100%' }}>
          <PageHeader
            title="Clients"
            subTitle={isMobile ? '' : 'List of Clients'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editBrand(brands.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="mb-05 sticky-filter-box">
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
                onPressEnter={fetch}
              />
            </Col>
          </Row>
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '31em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={brands}
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <BrandDetail
            onSave={onSaveBrand}
            onCancel={onCancelBrand}
            brand={currentBrand as Brand}
          />
        </div>
      )}
    </>
  );
};

export default Brands;
