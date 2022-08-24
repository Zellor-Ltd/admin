/* eslint-disable react-hooks/exhaustive-deps */
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { Promotion } from 'interfaces/Promotion';
import moment from 'moment';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import { deletePromotion, fetchPromotions } from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import PromotionDetail from './PromotionDetail';

const Promotions: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setloading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setloading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion>();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [dateFilter, setDateFilter] = useState<any[]>([]);
  const [idFilter, setIdFilter] = useState<string>('');
  const { isMobile } = useContext(AppContext);

  const getResources = useCallback(async () => {
    await getPromotions();
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  const getPromotions = useCallback(async () => {
    const { results } = await doFetch(fetchPromotions);
    setPromotions(results);
  }, []);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
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
      sorter: (a, b): any => {
        if (a.id && b.id) return a.id.localeCompare(b.id);
        else if (a.id) return -1;
        else if (b.id) return 1;
        else return 0;
      },
    },
    {
      title: 'Master Brand',
      dataIndex: ['brand', 'brandName'],
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.brand && b.brand)
          return a.brand.brandName.localeCompare(b.brand.brandName);
        else if (a.brand) return -1;
        else if (b.brand) return 1;
        else return 0;
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
          row.id?.toUpperCase().indexOf(idFilter?.toUpperCase()) > -1 &&
          moment(row.hCreationDate).utc().isBetween(startDate, endDate)
      );
    }
    return rows.filter(
      row => row.id?.toUpperCase().indexOf(idFilter?.toUpperCase()) > -1
    );
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
            subTitle={isMobile ? '' : 'List of Promotions'}
            className={isMobile ? 'mb-n1' : ''}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editPromotion(promotions.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Search
              </Typography.Title>
              <Input
                placeholder="Search by ID"
                suffix={<SearchOutlined />}
                onChange={event => setIdFilter(event.target.value)}
                className="mb-1"
              />
            </Col>
          </Row>
          <Table
            scroll={{ x: true }}
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={search(promotions)}
            loading={loading}
            pagination={false}
          />
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
