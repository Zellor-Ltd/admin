import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
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
import { PromoDisplay } from 'interfaces/PromoDisplay';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deletePromoDisplay,
  fetchPromoDisplays,
} from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import PromoDisplayDetail from './PromoDisplayDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const PromoDisplays: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromoDisplay, setCurrentPromoDisplay] =
    useState<PromoDisplay>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [promoDisplays, setPromoDisplays] = useState<PromoDisplay[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [content, setContent] = useState<PromoDisplay[]>([]);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getPromoDisplays();
  };

  const getPromoDisplays = async () => {
    const { results } = await doFetch(fetchPromoDisplays);
    setContent(results);
    setRefreshing(true);
  };

  const updateDisplayedArray = () => {
    if (!content.length) {
      setEof(true);
      return;
    }

    const pageToUse = refreshing ? 0 : page;
    const results = content.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setPromoDisplays(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setPromoDisplays([]);
      setEof(false);
      updateDisplayedArray();
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

      if (search(promoDisplays).length < 10) setEof(true);
    }
  }, [details, promoDisplays]);

  const editPromoDisplay = (index: number, promoDisplay?: PromoDisplay) => {
    setLastViewedIndex(index);
    setCurrentPromoDisplay(promoDisplay);
    setDetails(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deletePromoDisplay({ id }));
    setPromoDisplays(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const columns: ColumnsType<PromoDisplay> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Shop Display ID',
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
      title: 'Display Start Date',
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
      title: 'Display Expire Date',
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
    return rows.filter(row => row.id.toLowerCase().indexOf(filter) > -1);
  };

  const refreshItem = (record: PromoDisplay) => {
    promoDisplays[lastViewedIndex] = record;
    setPromoDisplays([...promoDisplays]);
  };

  const onSavePromoDisplay = (record: PromoDisplay) => {
    refreshItem(record);
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
            subTitle="List of Shop Displays"
            extra={[
              <Button
                key="1"
                onClick={() => editPromoDisplay(promoDisplays.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={8} xs={16}>
              <Typography.Title level={5}>Search by ID</Typography.Title>
              <Input
                className="mb-1"
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={promoDisplays.length}
            next={updateDisplayedArray}
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
              dataSource={search(promoDisplays)}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
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
