import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { Promotion } from 'interfaces/Promotion';
import moment from 'moment';
import { useCallback, useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deletePromotion,
  fetchPromoStatus,
  fetchPromotions,
} from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import PromotionDetail from './PromotionDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const Promotions: React.FC<RouteComponentProps> = ({ location }) => {
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setTableLoading });
  const [promoStatusList, setPromoStatusList] = useState<any>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [dateFilter, setDateFilter] = useState<any[]>([]);
  const [idFilter, setIdFilter] = useState<string>('');

  const getResources = useCallback(async () => {
    await Promise.all([getPromotions(), getPromoStatus()]);
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  const getPromotions = useCallback(async () => {
    const { results } = await doFetch(fetchPromotions);
    setPromotions(results);
    setRefreshing(true);
  }, []);

  const getPromoStatus = useCallback(async () => {
    const { results } = await doFetch(fetchPromoStatus);
    setPromoStatusList(results[0]?.promoStatus);
  }, []);

  const fetchData = () => {
    if (!promotions.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = promotions.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setPromotions(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setPromotions([]);
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

      if (search(promotions).length < 10) setEof(true);
    }
  }, [details, promotions]);

  const columns: ColumnsType<Promotion> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Promo ID',
      dataIndex: 'id',
      width: '10%',
      render: (value: string, record: Promotion, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editPromotion(index, record)}
        >
          {value}
        </Link>
      ),
      sorter: (a, b) => {
        return a.id.localeCompare(b.id);
      },
    },
    {
      title: 'Master Brand',
      dataIndex: ['brand', 'brandName'],
      width: '10%',
      align: 'center',
      sorter: (a, b) => {
        return a.brand.brandName.localeCompare(b.brand.brandName);
      },
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '10%',
      align: 'center',
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={values => setDateFilter(values as any)}
        />
      ),
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
      sorter: (a, b) =>
        moment(a.hCreationDate).unix() - moment(b.hCreationDate).unix(),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editPromotion(index, record)}
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
    if (dateFilter?.length) {
      const startDate = moment(dateFilter[0], 'DD/MM/YYYY')
        .startOf('day')
        .utc();
      const endDate = moment(dateFilter[1], 'DD/MM/YYYY').endOf('day').utc();

      return rows.filter(
        row =>
          row.id.toLowerCase().indexOf(idFilter) > -1 &&
          moment(row.hCreationDate).utc().isBetween(startDate, endDate)
      );
    }
    return rows.filter(row => row.id.toLowerCase().indexOf(idFilter) > -1);
  };

  const editPromotion = (index: number, promotion?: Promotion) => {
    setLastViewedIndex(index);
    setCurrentPromotion(promotion);
    setDetails(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deletePromotion({ id }));
    setPromotions(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };
  const refreshItem = (record: Promotion) => {
    promotions[lastViewedIndex] = record;
    setPromotions([...promotions]);
  };

  const onSavePromotion = (record: Promotion) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelPromotion = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div className="promotions">
          <PageHeader
            title="Promotions"
            subTitle="List of Promotions"
            extra={[
              <Button key="1" onClick={() => editPromotion(promotions.length)}>
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={8} xs={16}>
              <Typography.Title level={5} title="Search">
                Search by ID
              </Typography.Title>
              <Input onChange={event => setIdFilter(event.target.value)} />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={promotions.length}
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
              dataSource={search(promotions)}
              loading={tableloading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <PromotionDetail
          promotion={currentPromotion}
          onSave={onSavePromotion}
          onCancel={onCancelPromotion}
        />
      )}
    </>
  );
};

export default Promotions;
