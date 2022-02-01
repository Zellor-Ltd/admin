import { CalendarOutlined, SearchOutlined } from '@ant-design/icons';
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
import useFilter from 'hooks/useFilter';
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

const Orders: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [orderUpdateList, setOrderUpdateList] = useState<boolean[]>([]);
  const [selectedFan, setSelectedFan] = useState<Fan | undefined>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [currentFan, setCurrentFan] = useState<Fan>();
  const [details, setDetails] = useState<boolean>(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [isFetchingFans, setIsFetchingFans] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const searchInput = useRef<Input>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [ordersSettings, setOrdersSettings] = useState([]);

  const {
    arrayList: orders,
    setArrayList: setOrders,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Order>([]);

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
    setLoading(true);
    const orders: Order[] = await getValidOrders();
    const ordersWithFanName = orders.map(order => {
      const fan = fans.find(fan => fan.id === order.userid);
      order.fanName = fan?.user;
      return order;
    });
    setOrders(ordersWithFanName);
    setRefreshing(true);
    setLoaded(true);
    setLoading(false);
  };

  const getValidOrders = async () => {
    const { results }: any = await fetchOrders();
    const orders = results.filter(
      (order: Order) => !!(order.product || order.cart)
    );
    return orders;
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredOrders([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  const fetchData = async () => {
    if (!filteredContent.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredOrders(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
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

  const handleDateChange = (values: any) => {
    if (!values) {
      removeFilterFunction('creationDate');
      setRefreshing(true);
      return;
    }
    const startDate = moment(values[0], 'DD/MM/YYYY').startOf('day').utc();
    const endDate = moment(values[1], 'DD/MM/YYYY').endOf('day').utc();
    addFilterFunction('creationDate', (orders: Order[]) =>
      orders.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
    setRefreshing(true);
  };

  const getFan = (fanId: string) => fans.find(fan => fan.id === fanId);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

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
      dataIndex: 'userid',
      width: '10%',
      align: 'left',
      ...getColumnSearchProps('userid'),
    },
    {
      title: 'Paid',
      dataIndex: 'paid',
      width: '5%',
      align: 'center',
      render: (value: boolean) => <b>{value ? 'Yes' : 'No'}</b>,
    },
    {
      title: 'Amount / 100',
      dataIndex: 'amount',
      width: '5%',
      align: 'center',
      render: (value: number) => `${value / 100}x`,
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
          onChange={handleDateChange}
        />
      ),
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
    },
    {
      title: 'Disco Dollars',
      dataIndex: 'discoDollars',
      width: '5%',
      align: 'center',
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
          {/* <div style={{ color: "grey" }}>({moment(value).fromNow()})</div> */}
        </>
      ),
    },
    // {
    //   title: "Actions",
    //   key: "action",
    //   width: "5%",
    //   align: "right",
    //   render: (_, record) => (
    //     <Link to={{ pathname: `/order`, state: record }}>
    //       <EditOutlined />
    //     </Link>
    //   ),
    // },
  ];

  useEffect(() => {
    const getFans = async () => {
      setIsFetchingFans(true);
      const response: any = await fetchFans();
      setFans(response.results);
      setIsFetchingFans(false);
    };

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
    getFans();
    getBrands();
  }, []);

  useEffect(() => {
    if (loaded) {
      fetch();
    }
  }, [setOrders]);

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction('brandName');
      setRefreshing(true);
      return;
    }
    addFilterFunction('brandName', orders =>
      orders.filter(order =>
        order.product
          ? order.product?.brand.brandName === _selectedBrand.brandName
          : order.cart.brandGroups.find(
              brandGroup => brandGroup.brandName === _selectedBrand.brandName
            )
      )
    );
    setRefreshing(true);
  };

  const onChangeFan = async (_selectedFan: Fan | undefined) => {
    setSelectedFan(_selectedFan);
    if (!_selectedFan) {
      removeFilterFunction('fanName');
      setRefreshing(true);
      return;
    }
    addFilterFunction('fanName', orders =>
      orders.filter(order => order.userid === _selectedFan.id)
    );
    setRefreshing(true);
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
          <PageHeader title="Orders" subTitle="List of Orders" />
          <Row align="bottom" justify="space-between">
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={8} xs={16}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <SimpleSelect
                    data={brands}
                    onChange={(_, brand) => onChangeBrand(brand)}
                    style={{ width: '100%' }}
                    selectedOption={''}
                    optionsMapping={optionsMapping}
                    placeholder={'Select a master brand'}
                    loading={isFetchingBrands}
                    disabled={isFetchingBrands}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
                <Col lg={8} xs={16}>
                  <Typography.Title level={5}>Fan Filter</Typography.Title>
                  <SimpleSelect
                    data={fans}
                    onChange={(_, fan) => onChangeFan(fan)}
                    style={{ width: '100%', marginBottom: '16px' }}
                    selectedOption={selectedFan?.user}
                    optionsMapping={fanOptionsMapping}
                    placeholder={'Select a fan'}
                    loading={isFetchingFans}
                    disabled={isFetchingFans}
                    allowClear={true}
                  ></SimpleSelect>
                </Col>
              </Row>
            </Col>
            <Col>
              <Button
                type="primary"
                onClick={fetch}
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
            dataLength={filteredOrders.length}
            next={fetchData}
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
              dataSource={filteredOrders}
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
