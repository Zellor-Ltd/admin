import {
  Col,
  DatePicker,
  message,
  PageHeader,
  Row,
  Select,
  Spin,
  Table,
  Typography,
} from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useEffect, useState } from 'react';
import { fetchCreators, fetchPayments } from '../../services/DiscoClubService';
import { Banner } from 'interfaces/Banner';
import { Creator } from 'interfaces/Creator';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Payment } from 'interfaces/Payment';
import { ColumnsType } from 'antd/lib/table';

interface PaymentHistoryProps {
  onSave?: (record: Banner) => void;
  onCancel?: () => void;
  setShowModal: (value: boolean) => void;
  setOneOffPaymentDetails: (value: boolean) => void;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = props => {
  const [, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [eof, setEof] = useState<boolean>(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [currentCreator, setCurrentCreator] = useState<Creator>();
  const [dateFrom, setDateFrom] = useState<string>();
  const [dateTo, setDateTo] = useState<string>();

  const handleResize = () => {
    if (window.innerWidth < 991) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

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
    setTotalAmount(0);
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
      message.warning('Cannot get Payments without selecting a Fan!');
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

  const columns: ColumnsType<Payment> = [
    {
      title: 'Date',
      dataIndex: 'hCreationDate',
      width: '10%',
      align: 'left',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.hCreationDate != nextRecord.hCreationDate,
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
      title: 'Description',
      dataIndex: 'description',
      width: '15%',
      sorter: (a, b): any => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return -1;
        else if (b.description) return 1;
        else return 0;
      },
      render: (value: string) =>
        value?.length > 50 ? `${value.toString().slice(0, 50)}(...)` : value,
    },
    {
      title: 'Creator Name',
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
      title: 'Creator Email',
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
      title: 'Creator Paypal',
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
      title: 'Amount',
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
      title: 'Number of Items',
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

  return (
    <>
      <PageHeader
        title="Payment History"
        subTitle="List of Previous Payments"
      />
      <Row align="bottom" justify="end" className="sticky-filter-box">
        <Col lg={16} xs={24}>
          <Row gutter={[8, 8]} justify="end">
            <Col lg={6} xs={24}>
              <Row justify="end" className={isMobile ? '' : 'mr-2 mt-03'}>
                <Col>
                  <Typography.Text type="secondary">Filter</Typography.Text>
                </Col>
              </Row>
            </Col>
            <Col lg={6} xs={24}>
              <Select
                style={{ width: '100%' }}
                onChange={value =>
                  setCurrentCreator(creators.find(item => item.id === value))
                }
                value={currentCreator?.id}
                placeholder="Creator"
                showSearch
                allowClear
                disabled={!creators.length}
                filterOption={(input, option) =>
                  !!option?.children
                    ?.toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {creators.map((curr: any) => (
                  <Select.Option key={curr.id} value={curr.id}>
                    {curr.firstName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col lg={6} xs={24}>
              <DatePicker.RangePicker
                onChange={onChangeRangePicker}
                disabled={!creators.length}
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
      </Row>
      <InfiniteScroll
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
          <div className="scroll-message">
            <b>End of results.</b>
          </div>
        }
      >
        <Table
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
            setTotalAmount(tempAmount);

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
                    €${totalAmount.toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6}></Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
        />
      </InfiniteScroll>
    </>
  );
};

export default PaymentHistory;
