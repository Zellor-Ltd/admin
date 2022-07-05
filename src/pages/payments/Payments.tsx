import {
  Button,
  Col,
  message,
  Modal,
  PageHeader,
  Row,
  Select,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from '../../hooks/useRequest';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import {
  fetchCommissions,
  fetchCreators,
  saveCommission,
} from '../../services/DiscoClubService';
import CopyIdToClipboard from '../../components/CopyIdToClipboard';
import { Creator } from '../../interfaces/Creator';
import { Commission } from '../../interfaces/Commission';
import ManualPayment from './ManualPayment';
import moment from 'moment';
import ManualCommission from './ManualCommission';

const Payments: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [manualPayment, setManualPayment] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string>();
  const [currentCreator, setCurrentCreator] = useState<string>();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [totalCommissionAmount, setTotalCommissionAmount] = useState<number>(0);
  const [smallestCommissionPercentage, setSmallestCommissionPercentage] =
    useState<number>(0);
  const [biggestCommissionPercentage, setBiggestCommissionPercentage] =
    useState<number>(0);
  const [totalSalePrice, setTotalSalePrice] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [manualCommission, setManualCommission] = useState<boolean>(false);

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

  async function getCreators() {
    const response: any = await fetchCreators({
      query: '',
    });
    setCreators(response.results);
  }

  const resetPage = () => {
    setCurrentCreator(undefined);
    setCurrentStatus(undefined);
  };

  useEffect(() => {
    setTotalSalePrice(0);
    setTotalCommissionAmount(0);
    if (!currentCreator) {
      setCommissions([]);
      return;
    }
    getCommissions();
  }, [currentCreator, currentStatus]);

  const getCommissions = async () => {
    setSelectedRowKeys([]);
    const { results } = await doFetch(() =>
      fetchCommissions({
        creatorId: currentCreator ?? '',
        status: currentStatus ?? '',
      })
    );
    setCommissions(results);
  };

  const payCommissions = async () => {
    if (totalCommissionAmount < 0) {
      message.warning('Warning: Cannot send negative payments!');
      return;
    }
    await doRequest(() =>
      saveCommission({
        creatorId: currentCreator as string,
        totalDue: totalCommissionAmount,
        items: selectedRowKeys,
      })
    );
    setSelectedRowKeys([]);
    setCommissions([]);
  };

  const columns: ColumnsType<Commission> = [
    {
      title: 'Date',
      dataIndex: 'hCreationDate',
      width: '10%',
      align: 'center',
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
      title: 'Due Date',
      dataIndex: 'dueDate',
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.dueDate != nextRecord.dueDate,
      render: (dueDate: Date) => moment(dueDate).format('DD/MM/YYYY'),
      sorter: (a, b): any => {
        if (a.dueDate && b.dueDate)
          return moment(a.dueDate).unix() - moment(b.dueDate).unix();
        else if (a.dueDate) return -1;
        else if (b.dueDate) return 1;
        else return 0;
      },
    },
    {
      title: 'Order ID',
      dataIndex: 'id',
      width: '25%',
      sorter: (a, b): any => {
        if (a.id && b.id) return a.id.localeCompare(b.id);
        else if (a.id) return -1;
        else if (b.id) return 1;
        else return 0;
      },
      render: (_, record: Commission) => <CopyIdToClipboard id={record.id} />,
    },
    {
      title: 'Product ID',
      dataIndex: ['item', 'id'],
      width: '25%',
      sorter: (a, b): any => {
        if (a.item?.id && b.item?.id)
          return a.item?.id.localeCompare(b.item?.id);
        else if (a.item?.id) return -1;
        else if (b.item?.id) return 1;
        else return 0;
      },
      render: (_, record: Commission) => (
        <CopyIdToClipboard id={record.item?.id} />
      ),
    },
    {
      title: 'Description',
      dataIndex: ['item', 'description'],
      width: '15%',
      sorter: (a, b): any => {
        if (a.item?.description && b.item?.description)
          return a.item?.description.localeCompare(b.item?.description);
        else if (a.item?.description) return -1;
        else if (b.item?.description) return 1;
        else return 0;
      },
      render: (value: string) =>
        value?.length > 50 ? `${value.toString().slice(0, 50)}(...)` : value,
    },
    {
      title: 'Quantity',
      dataIndex: ['item', 'quantity'],
      width: '10%',
      sorter: (a, b): any => {
        if (a.item?.quantity && b.item?.quantity)
          return a.item?.quantity - b.item?.quantity;
        else if (a.item?.quantity) return -1;
        else if (b.item?.quantity) return 1;
        else return 0;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '15%',
      sorter: (a, b): any => {
        if (a.status && b.status) return a.status.localeCompare(b.status);
        else if (a.status) return -1;
        else if (b.status) return 1;
        else return 0;
      },
    },
    {
      title: 'Price',
      dataIndex: ['item', 'totalPrice'],
      width: '10%',
      sorter: (a, b): any => {
        if (a.item?.totalPrice && b.item?.totalPrice)
          return a.item?.totalPrice - b.item?.totalPrice;
        else if (a.item?.totalPrice) return -1;
        else if (b.item?.totalPrice) return 1;
        else return 0;
      },
      render: (value: number) => `€${value}`,
    },
    {
      title: 'Discount',
      dataIndex: ['item', 'totalPrice'],
      width: '10%',
      sorter: (a, b): any => {
        if (a.item?.totalPrice && b.item?.totalPrice)
          return a.item?.totalPrice - b.item?.totalPrice;
        else if (a.item?.totalPrice) return -1;
        else if (b.item?.totalPrice) return 1;
        else return 0;
      },
      render: (_: number, entity: Commission) =>
        `${
          ((entity.item?.totalDiscountedPrice - entity.item?.totalPrice) *
            100) /
          entity.item?.totalPrice
        }%`,
    },
    {
      title: 'Sale Price',
      dataIndex: ['item', 'totalDiscountedPrice'],
      width: '10%',
      sorter: (a, b): any => {
        if (a.item?.totalDiscountedPrice && b.item?.totalDiscountedPrice)
          return a.item?.totalDiscountedPrice - b.item?.totalDiscountedPrice;
        else if (a.item?.totalDiscountedPrice) return -1;
        else if (b.item?.totalDiscountedPrice) return 1;
        else return 0;
      },
      render: (value: number) => `€${value}`,
    },
    {
      title: 'Commission %',
      dataIndex: 'commissionPercentage',
      width: '10%',
      sorter: (a, b): any => {
        if (a.commissionPercentage && b.commissionPercentage)
          return a.commissionPercentage - b.commissionPercentage;
        else if (a.commissionPercentage) return -1;
        else if (b.commissionPercentage) return 1;
        else return 0;
      },
      render: (value: number) => `${value}%`,
    },
    {
      title: 'Commission',
      dataIndex: 'commissionAmount',
      width: '10%',
      sorter: (a, b): any => {
        if (a.commissionAmount && b.commissionAmount)
          return a.commissionAmount - b.commissionAmount;
        else if (a.commissionAmount) return -1;
        else if (b.commissionAmount) return 1;
        else return 0;
      },
      render: (value: number) => `€${value}`,
    },
  ];

  const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKeys);
    setTotalSalePrice(0);
    setTotalCommissionAmount(0);
    setSmallestCommissionPercentage(selectedRows[0]?.commissionPercentage);
    setBiggestCommissionPercentage(selectedRows[0]?.commissionPercentage);

    selectedRows.forEach(
      ({ item, commissionAmount, commissionPercentage, status }) => {
        if (status === 'Returned') {
          setTotalSalePrice(prev => prev - item?.totalDiscountedPrice);
          setTotalCommissionAmount(prev => prev - commissionAmount);
        } else {
          setTotalSalePrice(prev => prev + item?.totalDiscountedPrice);
          setTotalCommissionAmount(prev => prev + commissionAmount);
        }

        let currentCommissionPercentage = commissionPercentage;
        if (smallestCommissionPercentage > currentCommissionPercentage)
          setSmallestCommissionPercentage(currentCommissionPercentage);
        if (biggestCommissionPercentage < currentCommissionPercentage)
          setBiggestCommissionPercentage(currentCommissionPercentage);
      }
    );
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: Commission) => ({
      disabled: record.status === 'Pending',
    }),
  };

  return (
    <>
      {!manualPayment && !manualCommission && (
        <>
          <PageHeader
            title="Commission Payments"
            subTitle="List of Commission Payments"
            extra={[
              <Button
                key="1"
                className="mt-1"
                onClick={() => setManualCommission(true)}
              >
                New Manual Commission
              </Button>,
              <Button
                key="2"
                type="primary"
                danger
                className="mt-1"
                onClick={() => setShowModal(true)}
              >
                New One-Off Payment
              </Button>,
              <Modal
                title="Are you sure?"
                visible={showModal}
                onOk={() => setManualPayment(true)}
                onCancel={() => setShowModal(false)}
                okText="Proceed"
                cancelText="Cancel"
              >
                <p>
                  One off payments are visible to creators as soon as they are
                  included, please make sure it is right and that the actual
                  payment was made to the creator PayPal account before
                  including it here.
                </p>
              </Modal>,
            ]}
          />
          <Row justify="end" align="bottom" className="sticky-filter-box">
            <Col lg={16} xs={24}>
              <Row justify="end" gutter={[8, 8]}>
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
                    onChange={setCurrentCreator}
                    value={currentCreator}
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
                  <Select
                    style={{ width: '100%' }}
                    onChange={setCurrentStatus}
                    value={currentStatus}
                    placeholder="Status"
                    disabled={!creators.length}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      !!option?.children
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    <Select.Option key={1} value={'Cleared'}>
                      Cleared
                    </Select.Option>
                    <Select.Option key={2} value={'Returned'}>
                      Returned
                    </Select.Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
          <>
            <Table
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowSelection={rowSelection}
              rowKey="id"
              columns={columns}
              dataSource={commissions}
              loading={loading}
              pagination={false}
              summary={pageData => {
                return (
                  <>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}></Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <Typography.Text strong>Total</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      <Table.Summary.Cell index={5}></Table.Summary.Cell>
                      <Table.Summary.Cell index={6}></Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                      <Table.Summary.Cell index={8}></Table.Summary.Cell>
                      <Table.Summary.Cell index={9}></Table.Summary.Cell>
                      <Table.Summary.Cell index={10}>
                        <Typography.Text>
                          {totalSalePrice >= 0
                            ? `€${totalSalePrice.toFixed(2)}`
                            : `-€${Math.abs(totalSalePrice).toFixed(2)}`}
                        </Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={11}>
                        <Typography.Text>
                          {smallestCommissionPercentage
                            ? smallestCommissionPercentage ===
                              biggestCommissionPercentage
                              ? `${smallestCommissionPercentage}%`
                              : `${smallestCommissionPercentage}% - ${biggestCommissionPercentage}%`
                            : '-'}
                        </Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={12}>
                        <Typography.Text>
                          {totalCommissionAmount >= 0
                            ? `€${totalCommissionAmount.toFixed(2)}`
                            : `-€${Math.abs(totalCommissionAmount).toFixed(2)}`}
                        </Typography.Text>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
            <Row justify="end" className="mr-1 mt-2" gutter={[8, 8]}>
              <Col>
                <Button
                  type="default"
                  disabled={
                    currentStatus === 'Status' && currentCreator === 'Creator'
                  }
                  onClick={resetPage}
                >
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  disabled={!selectedRowKeys.length}
                  onClick={payCommissions}
                >
                  Pay
                </Button>
              </Col>
            </Row>
          </>
        </>
      )}
      {manualPayment && (
        <ManualPayment
          creators={creators}
          setShowModal={setShowModal}
          setManualPayment={setManualPayment}
        />
      )}
      {manualCommission && (
        <ManualCommission
          creators={creators}
          defaultCreator={currentCreator}
          setManualCommission={setManualCommission}
        />
      )}
    </>
  );
};

export default Payments;
