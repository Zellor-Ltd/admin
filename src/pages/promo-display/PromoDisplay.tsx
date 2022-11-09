/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
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
import { useRequest } from 'hooks/useRequest';
import { PromoDisplay } from 'interfaces/PromoDisplay';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deletePromoDisplay,
  fetchPromoDisplays,
} from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import scrollIntoView from 'scroll-into-view';
import PromoDisplayDetail from './PromoDisplayDetail';

const PromoDisplays: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromoDisplay, setCurrentPromoDisplay] =
    useState<PromoDisplay>();
  const [buffer, setBuffer] = useState<PromoDisplay[]>([]);
  const [data, setData] = useState<PromoDisplay[]>([]);
  const [filter, setFilter] = useState<string>('');
  const { isMobile } = useContext(AppContext);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
  }, [filter, buffer]);

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  const getResources = async () => {
    await getPromoDisplays();
  };

  const getPromoDisplays = async () => {
    const { results } = await doFetch(fetchPromoDisplays);
    setBuffer(results);
  };

  useEffect(() => {
    if (!details) scrollToCenter(lastViewedIndex);
  }, [details, data]);

  const editPromoDisplay = (index: number, promoDisplay?: PromoDisplay) => {
    setLastViewedIndex(index);
    setCurrentPromoDisplay(promoDisplay);
    setDetails(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deletePromoDisplay({ id }));
    setBuffer(buffer.filter(item => item.id !== id));
  };

  const columns: ColumnsType<PromoDisplay> = [
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
      render: id => <CopyValueToClipboard value={id} />,
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
            <Tooltip title="Shop Display ID">Shop Display ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '20%',
      render: (value: string, record: PromoDisplay, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editPromoDisplay(index, record)}
        >
          {value}
        </Link>
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
            <Tooltip title="Display Start Date">Display Start Date</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'displayStartDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
      sorter: (a, b): any => {
        if (a.displayStartDate && b.displayStartDate)
          return (
            moment(a.displayStartDate).unix() -
            moment(b.displayStartDate).unix()
          );
        else if (a.displayStartDate) return -1;
        else if (b.displayStartDate) return 1;
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
            <Tooltip title="Display Expire Date">Display Expire Date</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'displayExpireDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
      sorter: (a, b): any => {
        if (a.displayExpireDate && b.displayExpireDate)
          return (
            moment(a.displayExpireDate).unix() -
            moment(b.displayExpireDate).unix()
          );
        else if (a.displayExpireDate) return -1;
        else if (b.displayExpireDate) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: PromoDisplay, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editPromoDisplay(index, record)}
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
    return rows.filter(
      row => row.id?.toUpperCase().indexOf(filter?.toUpperCase()) > -1
    );
  };

  const refreshItem = (record: PromoDisplay, newItem?: boolean) => {
    const tmp = buffer.map(item => {
      if (item.id === record.id) return record;
      else return item;
    });

    setBuffer(newItem ? [...tmp, record] : [...tmp]);
    scrollToCenter(data.length - 1);
  };

  const onSavePromoDisplay = (record: PromoDisplay, newItem?: boolean) => {
    if (newItem) setFilter('');
    refreshItem(record, newItem);
    setDetails(false);
  };

  const onCancelPromoDisplay = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Shop Display"
            subTitle={isMobile ? '' : 'List of Shop Displays'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editPromoDisplay(buffer.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="sticky-filter-box mb-05">
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                allowClear
                disabled={loading}
                placeholder="Search by ID"
                suffix={<SearchOutlined />}
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <div style={{ height: '100%' }}>
            <Table
              style={{ minHeight: '100vh' }}
              className="mt-1"
              scroll={{ x: true, y: 300 }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {details && (
        <PromoDisplayDetail
          promoDisplay={currentPromoDisplay}
          onSave={onSavePromoDisplay}
          onCancel={onCancelPromoDisplay}
        />
      )}
    </>
  );
};

export default PromoDisplays;
