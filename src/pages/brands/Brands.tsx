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
  Spin,
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
import { SimpleSwitch } from '../../components/SimpleSwitch';
import { PauseModal } from './PauseModal';
import BrandDetail from './BrandDetail';
import scrollIntoView from 'scroll-into-view';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from 'hooks/useRequest';

const tagColorByStatus: any = {
  approved: 'green',
  rejected: 'red',
  pending: '',
};

const Brands: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [details, setDetails] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [content, setContent] = useState<Brand[]>([]);
  const [filterText, setFilterText] = useState('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [currentBrand, setCurrentBrand] = useState<Brand>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetch();
  }, []);

  useEffect(() => {
    if (refreshing) {
      setBrands([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    setRefreshing(true);
  }, [filterText]);

  const fetchData = async () => {
    if (!content.length) return;
    const pageToUse = refreshing ? 0 : page;
    const results = content.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setBrands(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  const fetch = async () => {
    const { results }: any = await doFetch(fetchBrands);
    setContent(results);
    setRefreshing(true);
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
      brand.brandName?.toUpperCase().includes(filterText.toUpperCase())
    );
  };

  const handleSwitchChange = async (
    switchType: 'showOutOfStock' | 'paused',
    brand: Brand,
    toggled: boolean
  ) => {
    if (switchType === 'showOutOfStock') {
      try {
        brand.showOutOfStock = toggled;
        await saveBrand(brand);
        message.success('Register updated with success.');
      } catch (error) {
        message.error("Couldn't set brand property. Try again.");
      }
    } else {
      setCurrentBrand(brand);
      setShowModal(true);
    }
  };

  const onCompletePausedAction = () => {
    fetch();
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
      render: (_, record: Brand) => <CopyIdToClipboard id={record.id} />,
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
    },
    {
      title: 'Paused',
      dataIndex: 'paused',
      width: '15%',
      align: 'center',
      render: (value: any, record: Brand) => (
        <>
          <SimpleSwitch
            toggled={!!record.paused}
            handleSwitchChange={toggled =>
              handleSwitchChange('paused', record, toggled)
            }
          />
          {showModal && (
            <PauseModal
              showPauseModal={showModal}
              setShowPauseModal={setShowModal}
              brandId={currentBrand?.id as string}
              isBrandPaused={!!currentBrand?.paused}
              onOk={onCompletePausedAction}
            />
          )}
        </>
      ),
    },
    {
      title: 'Show Out of Stock',
      dataIndex: 'showOutOfStock',
      width: '15%',
      align: 'center',
      render: (value: any, record: Brand) => (
        <SimpleSwitch
          toggled={!!record.showOutOfStock}
          handleSwitchChange={toggled =>
            handleSwitchChange('showOutOfStock', record, toggled)
          }
        />
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
            subTitle="List of Master Brands"
            extra={[
              <Button key="1" onClick={() => editBrand(filterBrand().length)}>
                New Item
              </Button>,
            ]}
          />
          <div className="sticky-filter-box" style={{ marginBottom: '16px' }}>
            <Row>
              <Col lg={12} xs={24}>
                <Typography.Title level={5} title="Search">
                  Search
                </Typography.Title>
                <Input onChange={onChangeFilter} suffix={<SearchOutlined />} />
              </Col>
            </Row>
          </div>
          <InfiniteScroll
            dataLength={filterBrand().length}
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
              dataSource={filterBrand()}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
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
