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
  Table,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { Promotion, PromotionAndStatusList } from 'interfaces/Promotion';
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

const Promotions: React.FC<RouteComponentProps> = ({ history, location }) => {
  const detailsPathname = `${location.pathname}/promotion`;
  const [tableloading, setTableLoading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setTableLoading });
  const [promoStatusList, setPromoStatusList] = useState<any>();
  const [content, setContent] = useState<any[]>([]);
  // const [promotionUpdateList, setPromotionUpdateList] = useState<boolean[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion>();

  const {
    // arrayList: promotions,
    setArrayList: setPromotions,
    filteredArrayList: filteredPromotions,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Promotion>([]);

  const handleDateChange = (values: any) => {
    if (!values) {
      removeFilterFunction('creationDate');
      return;
    }
    const startDate = moment(values[0], 'DD/MM/YYYY').startOf('day').utc();
    const endDate = moment(values[1], 'DD/MM/YYYY').endOf('day').utc();
    addFilterFunction('creationDate', (promotions: Promotion[]) =>
      promotions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
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

  const editPromotion = (index: number, promotion?: Promotion) => {
    setLastViewedIndex(index);
    setCurrentPromotion(promotion);
    setDetails(true);
  };

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

  const getPromotions = useCallback(async () => {
    const { results } = await doFetch(fetchPromotions);
    setPromotions(results);
    setContent(results);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPromoStatus = useCallback(async () => {
    const { results } = await doFetch(fetchPromoStatus);
    setPromoStatusList(results[0]?.promoStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = useCallback(async () => {
    await Promise.all([getPromotions(), getPromoStatus()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteItem = async (id: string) => {
    await doRequest(() => deletePromotion({ id }));
    for (let i = 0; i < content.length; i++) {
      if (content[i].id === id) {
        const index = i;
        setPromotions(prev => [
          ...prev.slice(0, index),
          ...prev.slice(index + 1),
        ]);
      }
    }
  };

  useEffect(() => {
    getResources();
  }, [getResources]);

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('promoId', promotions =>
      promotions.filter(promotion =>
        promotion.id.toUpperCase().includes(filterText.toUpperCase())
      )
    );
  };

  return (
    <>
      {!details && (
        <div className="promotions">
          <PageHeader
            title="Promotions"
            subTitle="List of Promotions"
            extra={[
              <Button key="1" onClick={() => editPromotion(1)}>
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
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredPromotions}
            loading={tableloading}
          />
        </div>
      )}
      {details && (
        <PromotionDetail promotion={currentPromotion} setDetails={setDetails} />
      )}
    </>
  );
};

export default Promotions;
