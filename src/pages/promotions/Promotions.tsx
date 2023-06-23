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
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { Promotion } from 'interfaces/Promotion';
import moment from 'moment';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import { deletePromotion, fetchPromotions } from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import scrollIntoView from 'scroll-into-view';
import PromotionDetail from './PromotionDetail';

const Promotions: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setloading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setloading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromotion, setCurrentPromotion] = useState<Promotion>();
  const [buffer, setBuffer] = useState<Promotion[]>([]);
  const [data, setData] = useState<Promotion[]>([]);
  const [dateFilter, setDateFilter] = useState<any[]>([]);
  const [idFilter, setIdFilter] = useState<string>('');
  const { isMobile, setisScrollable } = useContext(AppContext);
  const [style, setStyle] = useState<any>();
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    if (!details) setStyle({ overflow: 'clip', height: '100%' });
    else setStyle({ overflow: 'scroll', height: '100%' });
  }, [details]);

  const getResources = useCallback(async () => {
    await getPromotions();
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
  }, [idFilter, dateFilter, buffer]);

  const getPromotions = useCallback(async () => {
    const { results } = await doFetch(fetchPromotions);
    setBuffer(results);
  }, []);

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    setisScrollable(details);

    if (!details) scrollToCenter(lastViewedIndex);
  }, [details]);

  const columns: ColumnsType<Promotion> = [
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
            <Tooltip title="ID">ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyValueToClipboard tooltipText="Copy ID" value={id} />,
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
            <Tooltip title="Promo ID">Promo ID</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Client">Client</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Creation">Creation</Tooltip>
          </div>
        </div>
      ),
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
    history.push(window.location.pathname);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deletePromotion({ id }));
    setBuffer(buffer.filter(item => item.id !== id));
  };

  const refreshItem = (record: Promotion, newItem?: boolean) => {
    const tmp = buffer.map(item => {
      if (item.id === record.id) return record;
      else return item;
    });

    setBuffer(newItem ? [...tmp, record] : [...tmp]);
    scrollToCenter(data.length - 1);
  };

  const onSavePromotion = (record: Promotion, newItem?: boolean) => {
    if (newItem) setIdFilter('');
    refreshItem(record, newItem);
    setDetails(false);
  };

  const onCancelPromotion = () => {
    setDetails(false);
  };

  return (
    <div style={style}>
      {!details && (
        <>
          <PageHeader
            title="Promotions"
            subTitle={isMobile ? '' : 'List of Promotions'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editPromotion(buffer.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="sticky-filter-box mb-05">
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Search
              </Typography.Title>
              <Input
                allowClear
                placeholder="Search by ID"
                suffix={<SearchOutlined />}
                onChange={event => setIdFilter(event.target.value)}
              />
            </Col>
          </Row>
          <div className="custom-table of-clip">
            <Table
              className="mt-1"
              scroll={{ x: true, y: '27em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
            />
          </div>
        </>
      )}
      {details && (
        <PromotionDetail
          promotion={currentPromotion}
          onSave={onSavePromotion}
          onCancel={onCancelPromotion}
        />
      )}
    </div>
  );
};

export default Promotions;
