import {
  CalendarOutlined,
  LoadingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Input,
  message,
  PageHeader,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Brand } from 'interfaces/Brand';
import { Fan } from 'interfaces/Fan';
import { Order } from 'interfaces/Order';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  fetchBrands,
  fetchFans,
  fetchOrders,
  fetchSettings,
  saveOrder,
} from 'services/DiscoClubService';
import CopyOrderToClipboard from 'components/CopyOrderToClipboard';
import { SelectOption } from 'interfaces/SelectOption';
import scrollIntoView from 'scroll-into-view';
import FanDetail from 'pages/fans/FanDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useMount } from 'react-use';
import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';
import { useRequest } from 'hooks/useRequest';
import { BaseOptionType } from 'antd/lib/cascader';

const Orders: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading: setLoading });
  const [orderUpdateList, setOrderUpdateList] = useState<boolean[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [currentFan, setCurrentFan] = useState<Fan>();
  const [selectedUser, setSelectedUser] = useState<Fan>();
  const [details, setDetails] = useState<boolean>(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const searchInput = useRef<Input>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [ordersSettings, setOrdersSettings] = useState([]);
  const [brandId, setBrandId] = useState<string>();
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [filter, setFilter] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fanFilterInput, setFanFilterInput] = useState<string>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const shouldUpdateDueDate = useRef(false);
  const originalOrderDueDate = useRef<Record<string, Date | undefined>>({});
  const [updatingOrderDueDate, setUpdatingOrderDueDate] = useState<
    Record<string, boolean>
  >({});

  const fanOptionMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  useMount(async () => {
    const response: any = await fetchSettings();
    setOrdersSettings(response.results[0].order);
  });

  useEffect(() => {
    if (refreshing) {
      setOrders([]);
      setEof(false);
      fetch();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (loaded || brandId || selectedUser) {
      setPage(0);
      setRefreshing(true);
    }
  }, [brandId, selectedUser]);

  const getFans = async (input?: string, loadNextPage?: boolean) => {
    const pageToUse = !!!loadNextPage ? 0 : optionsPage;
    if (fanFilterInput !== input) setFanFilterInput(input);
    const response: any = await fetchFans({
      page: pageToUse,
      query: input,
    });
    setOptionsPage(pageToUse + 1);

    const validUsers = response.results.filter(
      (fan: Fan) => !fan.userName?.includes('guest')
    );

    if (pageToUse === 0) setFans(validUsers);
    else setFans(prev => [...prev.concat(validUsers)]);
    return response.results;
  };

  const fetch = async (loadNextPage?: boolean) => {
    const pageToUse = loadNextPage ? page : 0;
    const { results }: any = await doFetch(() =>
      fetchOrders({
        page: pageToUse,
        brandId: brandId,
        userId: selectedUser?.id,
      })
    );
    setPage(pageToUse + 1);
    if (results.length < 50) setEof(true);
    const validOrders = results.filter(
      (order: Order) => !!(order.product || order.cart)
    );
    if (pageToUse === 0) setOrders(validOrders);
    else setOrders(prev => [...prev.concat(validOrders)]);
    setLoaded(true);
  };

  const loadNext = async () => {
    fetch(true);
  };

  const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
    confirm();
    setSearchText(selectedKeys[0]);
  };

  const handleReset = (clearFilters: any) => {
    clearFilters();
    setSearchText('');
  };

  const handleSelectChange = async (
    value: string,
    order: Order,
    index: number
  ) => {
    const currentOrderUpdateList = [...orderUpdateList];
    currentOrderUpdateList[index] = true;
    setOrderUpdateList(currentOrderUpdateList);
    await saveOrder({
      ...order,
      stage: value,
    });

    const _orders = [...orders];
    _orders[index].hLastUpdate = moment
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSSSSSSZ');
    setOrders(_orders);

    message.success('Changes saved!');
    setOrderUpdateList(prev => {
      prev[index] = false;
      return [...prev];
    });
  };

  const search = rows => {
    if (filter?.length) {
      const startDate = moment(filter[0], 'DD/MM/YYYY').startOf('day').utc();
      const endDate = moment(filter[1], 'DD/MM/YYYY').endOf('day').utc();

      return rows.filter(row =>
        moment(row.hCreationDate).utc().isBetween(startDate, endDate)
      );
    }
    return rows;
  };

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details, orders]);

  const editFan = (index: number, fan?: Fan) => {
    setLastViewedIndex(index);
    setCurrentFan(fan);
    setDetails(true);
  };

  const getColumnSearchProps = (dataIndex: any) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: any;
      selectedKeys: any;
      confirm: any;
      clearFilters: any;
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
            }}
          >
            Filter
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: any) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value: any, record: any) => {
      const fan = getFan(record.userid);
      return fan?.user.includes(value.toLowerCase()) || false;
    },
    onFilterDropdownVisibleChange: (visible: any) => {
      if (visible) {
        setTimeout(() => searchInput.current!.select(), 100);
      }
    },
    render: (userId: any, _, index: number) => {
      const fan = getFan(userId);
      return (
        <Link to={location.pathname} onClick={() => editFan(index, fan)}>
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            autoEscape
            textToHighlight={fan?.user || ''}
          />
        </Link>
      );
    },
  });

  const onChangeColumnDate = (value: Date, order: Order) => {
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].id === order.id) {
        if (originalOrderDueDate.current[order.id!] === undefined) {
          originalOrderDueDate.current[order.id!] = order.index;
        }

        shouldUpdateDueDate.current =
          originalOrderDueDate.current[order.id!] !== value;

        orders[i].dueDate = value;
        setOrders([...orders]);
        break;
      }
    }
  };

  const onBlurColumnDate = async (order: Order) => {
    if (!shouldUpdateDueDate.current) {
      return;
    }
    setUpdatingOrderDueDate(prev => {
      const newValue = {
        ...prev,
      };
      newValue[order.id!] = true;

      return newValue;
    });
    try {
      await saveOrder(order);
      message.success('Register updated with success.');
    } catch (err) {
      console.error(
        `Error while trying to update Order[${order.id}] index.`,
        err
      );
      message.success('Error while trying to update order index.');
    }
    setUpdatingOrderDueDate(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[order.id!];
      return newValue;
    });
    delete originalOrderDueDate.current[order.id!];
    shouldUpdateDueDate.current = false;
  };

  const columns: ColumnsType<Order> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyOrderToClipboard order={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      width: '9%',
      align: 'center',
      render: (_, record) =>
        record.product
          ? record.product?.name
          : record.cart.brandGroups[0]
          ? record.cart.brandGroups[0].items[0].name
          : 'Empty order',
      sorter: (a, b) => {
        if (a.product && b.product) {
          return a.product.name.localeCompare(b.product.name);
        }
        if (a.product && !b.product) {
          return a.product.name.localeCompare(
            b.cart.brandGroups[0].items[0].name
          );
        }
        if (!a.product && b.product) {
          return a.cart.brandGroups[0].items[0].name.localeCompare(
            b.product.name
          );
        }
        if (!a.product && !b.product) {
          if (
            !a.cart.brandGroups[0].items[0].name &&
            !b.cart.brandGroups[0].items[0].name
          )
            return 0;
          return a.cart.brandGroups[0].items[0].name.localeCompare(
            b.cart.brandGroups[0].items[0].name
          );
        }
      },
    },
    {
      title: 'User',
      dataIndex: 'customerEmail',
      width: '9%',
      align: 'center',
      ...getColumnSearchProps('customerEmail'),
      render: (value: string) => `${value}`,
      sorter: (a, b): any => {
        if (a.customerEmail && b.customerEmail)
          return a.customerEmail.localeCompare(b.customerEmail);
        else if (a.customerEmail) return -1;
        else if (b.customerEmail) return 1;
        else return 0;
      },
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      width: '5%',
      align: 'center',
      render: (value: boolean) => <b>{value ? 'Yes' : 'No'}</b>,
      sorter: (a, b): any => {
        if (a.paid && b.paid) return 0;
        else if (a.paid) return -1;
        else if (b.paid) return 1;
        else return 0;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: '5%',
      align: 'center',
      render: (value: number) => `${Math.round(value / 100).toFixed(2)}`,
      sorter: (a, b): any => {
        if (a.amount && b.amount) return a.amount - b.amount;
        else if (a.amount) return -1;
        else if (b.amount) return 1;
        else return 0;
      },
    },
    {
      title: 'Disco Dollars',
      dataIndex: 'discoDollars',
      width: '5%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.discoDollars && b.discoDollars)
          return a.discoDollars - b.discoDollars;
        else if (a.discoDollars) return -1;
        else if (b.discoDollars) return 1;
        else return 0;
      },
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '9%',
      align: 'center',
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={values => setFilter(values as any)}
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
            moment(a.hCreationDate).unix() - moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
      },
    },
    {
      title: 'Stage',
      dataIndex: 'stage',
      width: '9%',
      align: 'center',
      render: (value: string, order, index) => (
        <Select
          loading={orderUpdateList[index]}
          disabled={orderUpdateList[index]}
          defaultValue={value}
          style={{ width: '175px' }}
          onChange={value => handleSelectChange(value, order, index)}
        >
          {ordersSettings.map((ordersSetting: any) => (
            <Select.Option
              key={ordersSetting.value}
              value={ordersSetting.value}
            >
              {ordersSetting.name}
            </Select.Option>
          ))}
        </Select>
      ),
      sorter: (a, b): any => {
        if (a.stage && b.stage) return a.stage.localeCompare(b.stage);
        else if (a.stage) return -1;
        else if (b.stage) return 1;
        else return 0;
      },
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      width: '9%',
      align: 'center',
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={values => setFilter(values as any)}
        />
      ),
      render: (value: Date, entity: Order) => {
        if (updatingOrderDueDate[entity.id!]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          if (entity.stage !== 'shipped') {
            return value ? (
              <>
                <div>{moment(value).format('DD/MM/YYYY')}</div>
                <div>{moment(value).format('HH:mm')}</div>
              </>
            ) : (
              '-'
            );
          } else {
            return (
              <DatePicker
                value={moment(value)}
                format="DD/MM/YYYY"
                onChange={value => onChangeColumnDate(value as any, entity)}
                onBlur={() => onBlurColumnDate(entity)}
              />
            );
          }
        }
      },
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
      title: 'Int. Status',
      dataIndex: 'commissionInternalStatus',
      width: '9%',
      align: 'center',
      render: (value: string, order, index) => (
        <Select
          loading={orderUpdateList[index]}
          disabled={orderUpdateList[index]}
          defaultValue={value}
          style={{ width: '175px' }}
          onChange={value => handleSelectChange(value, order, index)}
        >
          {ordersSettings.map((ordersSetting: any) => (
            <Select.Option
              key={ordersSetting.value}
              value={ordersSetting.value}
            >
              {ordersSetting.name}
            </Select.Option>
          ))}
        </Select>
      ),
      sorter: (a, b): any => {
        if (a.commissionInternalStatus && b.commissionInternalStatus)
          return a.commissionInternalStatus.localeCompare(
            b.commissionInternalStatus
          );
        else if (a.commissionInternalStatus) return -1;
        else if (b.commissionInternalStatus) return 1;
        else return 0;
      },
    },
    {
      title: 'Last Update',
      dataIndex: 'hLastUpdate',
      width: '10%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
      sorter: (a, b): any => {
        if (a.hLastUpdate && b.hLastUpdate)
          return moment(a.hLastUpdate).unix() - moment(b.hLastUpdate).unix();
        else if (a.hLastUpdate) return -1;
        else if (b.hLastUpdate) return 1;
        else return 0;
      },
    },
  ];

  useEffect(() => {
    const getBrands = async () => {
      try {
        setIsFetchingBrands(true);
        const { results }: any = await fetchBrands();
        setBrands(results.filter((brand: any) => brand.brandName));
        setIsFetchingBrands(false);
      } catch (e) {
      } finally {
      }
    };
    getBrands();
  }, []);

  const handleChangeBrand = async (_?: string, option?: BaseOptionType) => {
    setOrders([]);
    const selectedEntity = brands.find(item => item.id === option?.value);
    setBrandId(selectedEntity?.id);
  };

  const getFan = (fanUser: string) => {
    return fans.find(fan => fan.user.includes(fanUser));
  };

  const onChangeFan = async (input?: string, fan?: Fan) => {
    setOrders([]);
    if (!fan) {
      setFanFilterInput('');
      setSelectedUser(undefined);
    } else {
      setFanFilterInput(input);
      setSelectedUser(fan);
    }
  };

  const onClearFan = () => {
    setFanFilterInput('');
    setSelectedUser(undefined);
  };

  const onSaveFan = (record: Fan) => {
    setDetails(false);
  };

  const onCancelFan = () => {
    setDetails(false);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      const selectedEntity = fans?.find(item => item.user === fanFilterInput);
      setSelectedUser(selectedEntity);
      if (!selectedEntity)
        message.warning(
          "Can't filter orders with incomplete Fan Filter! Please select a Fan."
        );
    }
  };

  return (
    <>
      {!details && (
        <div className="orders">
          <PageHeader title="Orders" subTitle="List of Orders" />
          <Row
            align="bottom"
            justify="space-between"
            className={'sticky-filter-box'}
          >
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={8} xs={16}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <Select
                    allowClear
                    onChange={handleChangeBrand}
                    style={{ width: '100%' }}
                    placeholder={'Select a master brand'}
                    value={brandId}
                    loading={isFetchingBrands}
                    disabled={isFetchingBrands}
                    showSearch
                    filterOption={(input, option) =>
                      !!option?.children
                        ?.toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {brands.map(curr => (
                      <Select.Option
                        key={curr.id}
                        value={curr.id}
                        label={curr.brandName}
                      >
                        {curr.brandName}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col lg={8} xs={16}>
                  <Typography.Title level={5}>Fan Filter</Typography.Title>
                  <MultipleFetchDebounceSelect
                    style={{ width: '100%' }}
                    onInput={getFans}
                    onChange={onChangeFan}
                    onClear={onClearFan}
                    optionMapping={fanOptionMapping}
                    placeholder="Search by fan e-mail"
                    options={fans}
                    input={fanFilterInput}
                    disabled={isFetchingBrands}
                    onInputKeyDown={(event: HTMLInputElement) =>
                      handleKeyDown(event)
                    }
                  ></MultipleFetchDebounceSelect>
                </Col>
              </Row>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={() => setRefreshing(true)}
                style={{
                  marginBottom: '20px',
                  marginRight: '25px',
                }}
              >
                Search
                <SearchOutlined style={{ color: 'white' }} />
              </Button>
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={search(orders).length}
            next={loadNext}
            hasMore={page > 0 && !eof}
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
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={search(orders)}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <FanDetail fan={currentFan} onSave={onSaveFan} onCancel={onCancelFan} />
      )}
    </>
  );
};

export default Orders;
