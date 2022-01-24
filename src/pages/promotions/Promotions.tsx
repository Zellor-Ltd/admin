import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  PageHeader,
  Popconfirm,
  Row,
  Spin,
  Table,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
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
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);

  const {
    setArrayList: setPromotions,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Promotion>([]);

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
    if (!filteredContent.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredPromotions(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredPromotions([]);
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
    },
    {
      title: 'Master Brand',
      dataIndex: ['brand', 'brandName'],
      width: '10%',
      align: 'center',
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
          onChange={handleDateChange}
        />
      ),
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

  const searchFilterFunction = (filterText: string) => {
    if (!filterText) {
      removeFilterFunction('promoId');
      setRefreshing(true);
      return;
    }
    addFilterFunction('promoId', promotions =>
      promotions.filter(promotion =>
        promotion.id.toUpperCase().includes(filterText.toUpperCase())
      )
    );
    setRefreshing(true);
  };

  const handleDateChange = (values: any) => {
    if (!values) {
      removeFilterFunction('creationDate');
      setRefreshing(true);
      return;
    }
    const startDate = moment(values[0], 'DD/MM/YYYY').startOf('day').utc();
    const endDate = moment(values[1], 'DD/MM/YYYY').endOf('day').utc();
    addFilterFunction('creationDate', (promotions: Promotion[]) =>
      promotions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
    setRefreshing(true);
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
    filteredPromotions[lastViewedIndex] = record;
    setPromotions([...filteredPromotions]);
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
              <Button
                key="1"
                onClick={() => editPromotion(filteredPromotions.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by ID"
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={filteredPromotions.length}
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
              dataSource={filteredPromotions}
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
