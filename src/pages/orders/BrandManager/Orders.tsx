import { CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import {
  AutoComplete,
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
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import scrollIntoView from 'scroll-into-view';
import FanDetail from 'pages/fans/FanDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useMount } from 'react-use';
import { useRequest } from 'hooks/useRequest';

const Orders: React.FC<RouteComponentProps> = ({ location }) => {
  const [orderUpdateList, setOrderUpdateList] = useState<boolean[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [currentFan, setCurrentFan] = useState<Fan>();
  const [details, setDetails] = useState<boolean>(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const searchInput = useRef<Input>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [ordersSettings, setOrdersSettings] = useState([]);
  const [fanFilter, setFanFilter] = useState<string>('');
  const [brandFilter, setBrandFilter] = useState<string>();
  const [options, setOptions] = useState<
    { label: string; value: string; key: string }[]
  >([]);
  const [filter, setFilter] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);

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

  const fetchUsers = async (_query?: string) => {
    const pageToUse = loading ? 0 : page;
    const response: any = await fetchFans({
      page: pageToUse,
      query: _query,
    });

    setPage(pageToUse + 1);

    const optionFactory = (option: any) => {
      return {
        label: option[fanOptionsMapping.label],
        value: option[fanOptionsMapping.value],
        key: option[fanOptionsMapping.value],
      };
    };

    const validUsers = response.results.filter(
      (fan: Fan) => !fan.userName?.includes('guest')
    );

    if (validUsers.length < 30) setEof(true);

    setOptions(validUsers.map(optionFactory));

    setFans(validUsers);
  };

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const fanOptionsMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  useMount(async () => {
    const response: any = await fetchSettings();
    setOrdersSettings(response.results[0].order);
  });

  const fetch = async () => {
    const { results }: any = await doFetch(() =>
      fetchOrders({
        page: 0,
        brandId: brandFilter,
        userId: fanFilter,
      })
    );
    const validOrders = results.filter(
      (order: Order) => !!(order.product || order.cart)
    );
    setOrders(prev => [...prev.concat(validOrders)]);
    if (validOrders.length < 10) setEof(true);
    setLoaded(true);
  };

  const loadNext = async () => {
    if (loaded) setPage(prev => prev + 1);
    fetch();
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
    orderIndex: number
  ) => {
    const currentOrderUpdateList = [...orderUpdateList];
    currentOrderUpdateList[orderIndex] = true;
    setOrderUpdateList(currentOrderUpdateList);
    await saveOrder({
      ...order,
      stage: value,
    });

    const _orders = [...orders];
    _orders[orderIndex].hLastUpdate = moment
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSSSSSSZ');
    setOrders(_orders);

    message.success('Changes saved!');
    setOrderUpdateList(prev => {
      prev[orderIndex] = false;
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
      if (search(orders).length < 10) setEof(true);
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

  const columns: ColumnsType<Order> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyOrderToClipboard order={id} />,
      align: 'center',
    },
    {
      title: 'User',
      dataIndex: 'customerEmail',
      width: '10%',
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
      render: (value: number) => `${value / 100}`,
      sorter: (a, b): any => {
        if (a.amount && b.amount) return a.amount - b.amount;
        else if (a.amount) return -1;
        else if (b.amount) return 1;
        else return 0;
      },
    },
    {
      title: 'Name',
      width: '12%',
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
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '10%',
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
      title: 'Stage',
      dataIndex: 'stage',
      width: '15%',
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

  const onChangeBrand = async (id: string | undefined) => {
    setBrandFilter(id);
    fetch();
  };

  const getFan = (fanUser: string) => {
    return fans.find(fan => fan.user.includes(fanUser));
  };

  const onChangeFan = async (value: string) => {
    const id = getFan(value)?.id;
    setFanFilter(id ?? '');
    fetch();
  };

  const onSearch = (value: string) => {
    fetchUsers(value);
  };

  const onSaveFan = (record: Fan) => {
    setDetails(false);
  };

  const onCancelFan = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div className="orders">
          <PageHeader
            title="Orders"
            subTitle={isMobile ? '' : 'List of Orders'}
            className={isMobile ? 'mb-n1' : ''}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="mb-1 sticky-filter-box"
            gutter={8}
          >
            <Col lg={16} xs={24}>
              <Row gutter={[8, 8]}>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <SimpleSelect
                    data={brands}
                    onChange={id => onChangeBrand(id)}
                    style={{ width: '100%' }}
                    optionsMapping={optionsMapping}
                    placeholder={'Select a Master Brand'}
                    loading={isFetchingBrands}
                    disabled={isFetchingBrands}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Fan Filter</Typography.Title>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={options}
                    onSelect={onChangeFan}
                    onSearch={onSearch}
                    placeholder="Type to search by E-mail"
                  />
                </Col>
              </Row>
            </Col>
            <Col lg={24} xs={24}>
              <Row justify="end" className={isMobile ? 'mt-2' : ''}>
                <Col>
                  <Button type="primary" onClick={fetch}>
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={orders.length}
            next={loadNext}
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
              dataSource={search(orders)}
              loading={loading}
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
