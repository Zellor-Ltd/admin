/* eslint-disable react-hooks/exhaustive-deps */
import {
  Col,
  Collapse,
  DatePicker,
  message,
  PageHeader,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { fetchCreators, fetchPayments } from '../../services/DiscoClubService';
import { Creator } from 'interfaces/Creator';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import scrollIntoView from 'scroll-into-view';
import { Payment } from 'interfaces/Payment';
import { ColumnsType } from 'antd/lib/table';
import { Link, RouteComponentProps } from 'react-router-dom';
import CommissionDetail from './CommissionDetail';

const { Panel } = Collapse;

const PaymentHistory: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const { isMobile } = useContext(AppContext);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [eof, setEof] = useState<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [currentPayment, setCurrentPayment] = useState<Payment>();
  const totalAmount = useRef<any>();
  const [currentCreator, setCurrentCreator] = useState<Creator>();
  const [dateFrom, setDateFrom] = useState<string>();
  const [dateTo, setDateTo] = useState<string>();

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  useEffect(() => {
    getCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refreshing) {
      getPayments();
      setEof(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    totalAmount.current = 0;
    if (!currentCreator && !dateFrom && !dateTo) {
      setPayments([]);
      return;
    }
    setRefreshing(true);
  }, [currentCreator, dateFrom, dateTo]);

  async function getCreators() {
    const response: any = await fetchCreators({
      query: '',
    });
    setCreators(response.results);
  }

  const getPayments = async () => {
    if (!currentCreator) {
      message.warning('Warning: Cannot get Payments without selecting a Fan!');
      return;
    }
    const pageToUse = refreshing ? 0 : page;
    const { result } = await doFetch(() =>
      fetchPayments({
        creatorId: currentCreator?.id,
        dateFrom: dateFrom,
        dateTo: dateTo,
        page: pageToUse,
      })
    );
    setPage(pageToUse + 1);
    if (pageToUse === 0) setPayments(result.payments);
    else setPayments(prev => prev.concat(result.payments));
    if (result.payments.length < 30) setEof(true);
  };

  const onChangeRangePicker = dates => {
    if (dates) {
      setDateFrom(moment(dates[0]).format('YYYY-MM-DD'));
      setDateTo(moment(dates[1]).format('YYYY-MM-DD'));
    } else {
      setDateFrom(undefined);
      setDateTo(undefined);
    }
  };

  const viewDetails = (index: number, payment?: Payment) => {
    setLastViewedIndex(index);
    setCurrentPayment(payment);
    setDetails(true);
  };

  const columns: ColumnsType<Payment> = [
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
            <Tooltip title="Date">Date</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hCreationDate',
      width: '10%',
      align: 'left',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.hCreationDate !== nextRecord.hCreationDate,
      render: (value: Date) => moment(value).format('DD/MM/YYYY'),
      sorter: (a, b): any => {
        if (a.hCreationDate && b.hCreationDate)
          return (
            moment(a.hCreationDate).unix() - moment(b.hCreationDate).unix()
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
            <Tooltip title="Description">Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'description',
      width: '15%',
      sorter: (a, b): any => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return -1;
        else if (b.description) return 1;
        else return 0;
      },
      render: (value: string, record: Payment, index: number) => (
        <Link to={location.pathname} onClick={() => viewDetails(index, record)}>
          {value?.length > 50 ? `${value.toString().slice(0, 50)}(...)` : value}
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
            <Tooltip title="Creator Name">Creator Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creatorId',
      width: '15%',
      sorter: (a, b): any => {
        if (a.creatorId && b.creatorId)
          return a.creatorId.localeCompare(b.creatorId);
        else if (a.creatorId) return -1;
        else if (b.creatorId) return 1;
        else return 0;
      },
      render: (value: string) => {
        return creators.find(item => item.id === value)?.firstName;
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
            <Tooltip title="Creator Email">Creator Email</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creatorId',
      width: '15%',
      sorter: (a, b): any => {
        if (a.creatorId && b.creatorId)
          return a.creatorId.localeCompare(b.creatorId);
        else if (a.creatorId) return -1;
        else if (b.creatorId) return 1;
        else return 0;
      },
      render: (value: string) => {
        return creators.find(item => item.id === value)?.user;
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
            <Tooltip title="Creator Paypal">Creator Paypal</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creatorId',
      width: '15%',
      sorter: (a, b): any => {
        if (a.creatorId && b.creatorId)
          return a.creatorId.localeCompare(b.creatorId);
        else if (a.creatorId) return -1;
        else if (b.creatorId) return 1;
        else return 0;
      },
      render: (value: string) => {
        return creators.find(item => item.id === value)?.paypal;
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
            <Tooltip title="Amount">Amount</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'payment',
      width: '10%',
      sorter: (a, b): any => {
        if (a.payment && b.payment) return a.payment - b.payment;
        else if (a.payment) return -1;
        else if (b.payment) return 1;
        else return 0;
      },
      render: (value: number) => {
        return value.toFixed(2);
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
            <Tooltip title="Number of Items">Number of Items</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'quantity',
      width: '10%',
      sorter: (a, b): any => {
        if (a.quantity && b.quantity) return a.quantity - b.quantity;
        else if (a.quantity) return -1;
        else if (b.quantity) return 1;
        else return 0;
      },
    },
  ];

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const Filters = () => {
    return (
      <>
        <Col lg={16} xs={24}>
          <Row gutter={[8, 8]} justify="end">
            {!isMobile && (
              <Col lg={6} xs={24}>
                <Row justify="end" className="mr-2 mt-03">
                  <Col>
                    <Typography.Text type="secondary">Filter</Typography.Text>
                  </Col>
                </Row>
              </Col>
            )}
            <Col lg={6} xs={24}>
              {isMobile && (
                <Typography.Title level={5}>Creator</Typography.Title>
              )}
              <Select
                style={{ width: '100%' }}
                onChange={value =>
                  setCurrentCreator(creators.find(item => item.id === value))
                }
                value={currentCreator?.id}
                placeholder="Creator"
                showSearch
                allowClear
                disabled={!creators.length || loading || refreshing}
                filterOption={filterOption}
              >
                {creators.map((curr: any) => (
                  <Select.Option
                    key={curr.id}
                    value={curr.id}
                    label={curr.firstName}
                  >
                    {curr.firstName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col lg={6} xs={24}>
              {isMobile && (
                <Typography.Title level={5}>Status</Typography.Title>
              )}
              <DatePicker.RangePicker
                onChange={onChangeRangePicker}
                className="mb-1"
                disabled={!creators.length || loading || refreshing}
                ranges={{
                  Today: [moment(), moment()],
                  'This Month': [
                    moment().startOf('month'),
                    moment().endOf('month'),
                  ],
                }}
                format="YYYY-MM-DD"
              />
            </Col>
          </Row>
        </Col>
      </>
    );
  };

  return (
    <div className="history-container">
      {!details && (
        <>
          <PageHeader
            title="Payment History"
            subTitle={isMobile ? '' : 'List of Previous Payments'}
          />
          {!isMobile && (
            <Row align="bottom" justify="end" className="custom-filter-box">
              <Filters />
            </Row>
          )}
          {isMobile && (
            <Collapse ghost className="sticky-filter-box">
              <Panel
                header={<Typography.Title level={5}>Filter</Typography.Title>}
                key="1"
              >
                <Row align="bottom" justify="end" className="pt-0">
                  <Filters />
                </Row>
              </Panel>
            </Collapse>
          )}
          <div className={payments.length ? '' : 'empty-table'}>
            <InfiniteScroll
              className={payments.length ? '' : 'empty-table'}
              dataLength={payments.length}
              next={getPayments}
              hasMore={!eof}
              loader={
                page !== 0 && (
                  <div className="scroll-message">
                    <Spin />
                  </div>
                )
              }
              endMessage={
                page !== 0 && (
                  <div className="scroll-message">
                    <b>End of results.</b>
                  </div>
                )
              }
            >
              <Table
                className={payments.length ? '' : 'empty-table'}
                scroll={{ x: true, y: 300 }}
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={columns}
                dataSource={payments}
                loading={refreshing}
                pagination={false}
                summary={pageData => {
                  let tempAmount = 0;
                  pageData.forEach(({ payment }) => {
                    tempAmount += payment;
                  });
                  totalAmount.current = tempAmount;

                  return (
                    <>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <Typography.Text strong>Total</Typography.Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}></Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        <Table.Summary.Cell index={4}></Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          €{totalAmount.current.toFixed(2)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}></Table.Summary.Cell>
                      </Table.Summary.Row>
                    </>
                  );
                }}
              />
            </InfiniteScroll>
          </div>
        </>
      )}
      {details && (
        <CommissionDetail setDetails={setDetails} commission={currentPayment} />
      )}
    </div>
  );
};

export default PaymentHistory;
