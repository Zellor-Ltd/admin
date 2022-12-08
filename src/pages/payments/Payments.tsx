/* eslint-disable eqeqeq */
import {
  Button,
  Col,
  Collapse,
  DatePicker,
  message,
  Modal,
  PageHeader,
  Row,
  Select,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from '../../hooks/useRequest';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { RouteComponentProps } from 'react-router-dom';
import {
  fetchCommissions,
  fetchCreators,
  saveCommission,
  updateCommission,
} from '../../services/DiscoClubService';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import { Creator } from '../../interfaces/Creator';
import { Commission } from '../../interfaces/Commission';
import ManualPayment from './ManualPayment';
import moment from 'moment';
import ManualCommission from './ManualCommission';
import { LoadingOutlined } from '@ant-design/icons';

const { Panel } = Collapse;

const Payments: React.FC<RouteComponentProps> = ({ history, location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [manualPayment, setManualPayment] = useState<boolean>(false);
  const [currentStatus, setCurrentStatus] = useState<string>();
  const [currentCreator, setCurrentCreator] = useState<string>();
  const [creators, setCreators] = useState<Creator[]>([]);
  const { isMobile } = useContext(AppContext);
  const [payments, setPayments] = useState<Commission[]>([]);
  const [totalCommissionAmount, setTotalCommissionAmount] = useState<number>(0);
  const [smallestCommissionPercentage, setSmallestCommissionPercentage] =
    useState<number>(0);
  const [biggestCommissionPercentage, setBiggestCommissionPercentage] =
    useState<number>(0);
  const [totalSalePrice, setTotalSalePrice] = useState<number>(0);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [manualCommission, setManualCommission] = useState<boolean>(false);
  const shouldUpdateDueDate = useRef(false);
  const [updatingDueDate, setUpdatingDueDate] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('1');

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
      setPayments([]);
      return;
    }
    getpayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCreator, currentStatus]);

  const getpayments = async () => {
    setSelectedRowKeys([]);
    const { results } = await doFetch(() =>
      fetchCommissions({
        creatorId: currentCreator ?? '',
        status: currentStatus ?? '',
      })
    );
    setPayments(results);
  };

  const payPayments = async () => {
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
    setPayments([]);
  };

  const onChangeDueDate = (value: Date, record: Commission, index: number) => {
    shouldUpdateDueDate.current = record.dueDate! !== value;
    payments[index].dueDate = value;
    setPayments([...payments]);
  };

  const onBlurDueDate = async (commission: Commission) => {
    if (!shouldUpdateDueDate.current) {
      return;
    }
    setUpdatingDueDate(true);
    try {
      await updateCommission({
        id: commission.id,
        dueDate: commission.dueDate,
      });
      message.success('Register updated with success.');
    } catch (err) {
      console.error(`Error while trying to update Due Date.`, err);
    }
    setUpdatingDueDate(false);
    shouldUpdateDueDate.current = false;
  };

  const columns: ColumnsType<Commission> = [
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
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.hCreationDate != nextRecord.hCreationDate,
      render: (value: Date) => moment(value).format('DD/MM/YY'),
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
            <Tooltip title="Due Date">Due Date</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'dueDate',
      width: '10%',
      align: 'center',
      responsive: ['sm'],
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.dueDate != nextRecord.dueDate,
      render: (value: Date, entity: Commission, index: number) => {
        if (updatingDueDate[entity.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <DatePicker
              style={{ width: '100px' }}
              defaultValue={moment(value)}
              format="DD/MM/YY"
              onChange={value => onChangeDueDate(value as any, entity, index)}
              onBlur={() => onBlurDueDate(entity)}
            />
          );
        }
      },
      sorter: (a, b): any => {
        if (a.dueDate && b.dueDate)
          return moment(a.dueDate).unix() - moment(b.dueDate).unix();
        else if (a.dueDate) return -1;
        else if (b.dueDate) return 1;
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
            <Tooltip title="Commission ID">Commission ID</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '25%',
      sorter: (a, b): any => {
        if (a.id && b.id) return a.id.localeCompare(b.id);
        else if (a.id) return -1;
        else if (b.id) return 1;
        else return 0;
      },
      render: (_, record: Commission) => (
        <CopyValueToClipboard value={record.id} />
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
            <Tooltip title="Product ID">Product ID</Tooltip>
          </div>
        </div>
      ),
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
        <CopyValueToClipboard value={record.item?.id} />
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
            <Tooltip title="Description">Description</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Quantity">Quantity</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Status">Status</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Price">Price</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['item', 'totalPrice'],
      width: '10%',
      sorter: (a, b): any => {
        if (a.item?.totalPrice && b.item?.totalPrice)
          return a.item?.totalPrice - b.item?.totalPrice;
        else if (a.item?.totalPrice) return -1;
        else if (b.item?.totalPrice) return 1;
        else return 0;
      },
      render: (value: number) => `€${value.toFixed(2)}`,
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
            <Tooltip title="Discount">Discount</Tooltip>
          </div>
        </div>
      ),
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
        `${(
          ((entity.item?.totalDiscountedPrice - entity.item?.totalPrice) *
            100) /
          entity.item?.totalPrice
        ).toFixed(2)}%`,
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
            <Tooltip title="Sale Price">Sale Price</Tooltip>
          </div>
        </div>
      ),
      dataIndex: ['item', 'totalDiscountedPrice'],
      width: '10%',
      sorter: (a, b): any => {
        if (a.item?.totalDiscountedPrice && b.item?.totalDiscountedPrice)
          return a.item?.totalDiscountedPrice - b.item?.totalDiscountedPrice;
        else if (a.item?.totalDiscountedPrice) return -1;
        else if (b.item?.totalDiscountedPrice) return 1;
        else return 0;
      },
      render: (value: number) => `€${value.toFixed(2)}`,
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
            <Tooltip title="Commission %">Commission %</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'commissionPercentage',
      width: '10%',
      sorter: (a, b): any => {
        if (a.commissionPercentage && b.commissionPercentage)
          return a.commissionPercentage - b.commissionPercentage;
        else if (a.commissionPercentage) return -1;
        else if (b.commissionPercentage) return 1;
        else return 0;
      },
      render: (value: number) => `${value.toFixed(2)}%`,
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
            <Tooltip title="Commission">Commission</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'commissionAmount',
      width: '10%',
      sorter: (a, b): any => {
        if (a.commissionAmount && b.commissionAmount)
          return a.commissionAmount - b.commissionAmount;
        else if (a.commissionAmount) return -1;
        else if (b.commissionAmount) return 1;
        else return 0;
      },
      render: (value: number) => `€${value.toFixed(2)}`,
    },
  ];

  //when fixing currency display, fix derived states as well
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRows]);

  const onSelectChange = (selectedRowKeys: any, selectedRows: any) => {
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
    setTotalSalePrice(0);
    setTotalCommissionAmount(0);
    setSmallestCommissionPercentage(selectedRows[0]?.commissionPercentage);
    setBiggestCommissionPercentage(selectedRows[0]?.commissionPercentage);
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: Commission) => ({
      disabled: record.status === 'Pending',
    }),
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  const Filters = () => {
    return (
      <>
        <Col lg={16} xs={24}>
          <Row justify="end" gutter={[8, 8]}>
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
                onChange={setCurrentCreator}
                value={currentCreator}
                placeholder="Creator"
                showSearch
                allowClear
                disabled={!creators.length || loading}
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
              <Select
                style={{ width: '100%' }}
                onChange={setCurrentStatus}
                value={currentStatus}
                placeholder="Status"
                className="mb-1"
                disabled={!creators.length || loading}
                showSearch
                allowClear
                filterOption={filterOption}
              >
                <Select.Option key={1} value="Cleared">
                  Cleared
                </Select.Option>
                <Select.Option key={2} value="Returned">
                  Returned
                </Select.Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </>
    );
  };

  const handleCollapseChange = () => {
    if (activeKey === '1') setActiveKey('0');
    else setActiveKey('1');
  };

  return (
    <div className="payments-container">
      {!manualPayment && !manualCommission && (
        <>
          <PageHeader
            title="Commission Payments"
            subTitle={isMobile ? '' : 'List of Commission Payments'}
            extra={[
              <Row gutter={8} justify="end" key="headerRow">
                <Col>
                  <Button
                    key="1"
                    className="mt-1"
                    onClick={() => setManualCommission(true)}
                  >
                    New Manual Commission
                  </Button>
                </Col>
                <Col>
                  <Button
                    key="2"
                    type="primary"
                    danger
                    className="mt-1"
                    onClick={() => setShowModal(true)}
                  >
                    New One-Off Payment
                  </Button>
                </Col>
              </Row>,
              <Modal
                key="headerModal"
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
          {!isMobile && (
            <Row
              justify="end"
              align="bottom"
              className="custom-filter-box mr-06"
            >
              <Filters />
            </Row>
          )}
          {isMobile && (
            <Collapse
              ghost
              className="sticky-filter-box"
              activeKey={activeKey}
              onChange={handleCollapseChange}
              destroyInactivePanel
            >
              <Panel
                header={
                  activeKey === '1' ? (
                    <Typography.Title level={5}>
                      Click to Collapse
                    </Typography.Title>
                  ) : (
                    <Typography.Title level={5}>Filter</Typography.Title>
                  )
                }
                key="1"
              >
                <Row justify="end" align="bottom" className="pt-0">
                  <Filters />
                </Row>
              </Panel>
            </Collapse>
          )}
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '25em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowSelection={rowSelection}
              rowKey="id"
              columns={columns}
              dataSource={payments}
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
                      <Table.Summary.Cell index={8}>
                        <Typography.Text>
                          {totalSalePrice >= 0
                            ? `€${totalSalePrice.toFixed(2)}`
                            : `-€${Math.abs(totalSalePrice).toFixed(2)}`}
                        </Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={9}>
                        <Typography.Text>
                          {smallestCommissionPercentage
                            ? smallestCommissionPercentage ===
                              biggestCommissionPercentage
                              ? `${smallestCommissionPercentage.toFixed(2)}%`
                              : `${smallestCommissionPercentage.toFixed(
                                  2
                                )}% - ${biggestCommissionPercentage.toFixed(
                                  2
                                )}%`
                            : '-'}
                        </Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={10}>
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
            <Row
              justify="end"
              className="mr-1 mt-2"
              gutter={[8, 8]}
              style={{
                position: 'fixed',
                bottom: '3rem',
                right: '3rem',
              }}
            >
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
                  onClick={payPayments}
                >
                  Pay
                </Button>
              </Col>
            </Row>
          </div>
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
    </div>
  );
};

export default Payments;
