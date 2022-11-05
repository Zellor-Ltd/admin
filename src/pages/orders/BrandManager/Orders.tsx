/* eslint-disable react-hooks/exhaustive-deps */
import { CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Input,
  message,
  PageHeader,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Brand } from 'interfaces/Brand';
import { Fan } from 'interfaces/Fan';
import { Order } from 'interfaces/Order';
import moment from 'moment';
import { useContext, useRef, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
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
  const [, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading: setLoading });
  const [orderUpdateList, setOrderUpdateList] = useState<boolean[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [currentFan, setCurrentFan] = useState<Fan>();
  const [selectedUser, setSelectedUser] = useState<Fan>();
  const [details, setDetails] = useState<boolean>(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const searchInput = useRef<Input>(null);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [ordersSettings, setOrdersSettings] = useState([]);
  const [brandId, setBrandId] = useState<string>();
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [filter, setFilter] = useState<any[]>([]);
  const [buffer, setBuffer] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [fanFilterInput, setFanFilterInput] = useState<string>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [cartTableContent, setCartTableContent] = useState<any>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>();

  const fanOptionMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };
  const { isMobile } = useContext(AppContext);

  useMount(async () => {
    const response: any = await fetchSettings();
    setOrdersSettings(response.results[0].order);
  });

  useEffect(() => {
    if (refreshing) {
      setBuffer([]);
      setEof(false);
      fetch();
    }
  }, [refreshing]);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
  }, [filter, buffer]);

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
    if (!loadNextPage) scrollToCenter(0);
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
    if (pageToUse === 0) setBuffer(validOrders);
    else setBuffer(prev => [...prev.concat(validOrders)]);
    setLoaded(true);
    setRefreshing(false);
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
    index: number,
    propName: 'stage' | 'commissionInternalStatus'
  ) => {
    const currentOrderUpdateList = [...orderUpdateList];
    currentOrderUpdateList[index] = true;
    setOrderUpdateList(currentOrderUpdateList);
    if (propName === 'stage') {
      await saveOrder({
        ...order,
        stage: value,
      });
    } else {
      await saveOrder({
        ...order,
        commissionInternalStatus: value,
      });
    }

    const tmp = [...data];
    tmp[index].hLastUpdate = moment
      .utc()
      .format('YYYY-MM-DDTHH:mm:ss.SSSSSSSZ');
    setData(tmp);

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

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    if (!details) {
      scrollToCenter(lastViewedIndex);
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
          allowClear
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
      return fan?.user.includes(value?.toUpperCase()) || false;
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
      render: id => <CopyOrderToClipboard order={id} />,
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      width: '14%',
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="User">User</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'customerEmail',
      width: '12%',
      align: 'center',
      ...getColumnSearchProps('customerEmail'),
      render: (value: string) => {
        return (
          <div style={{ display: 'grid', placeItems: 'stretch' }}>
            <div
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <Tooltip title={value}>{value}</Tooltip>
            </div>
          </div>
        );
      },
      sorter: (a, b): any => {
        if (a.customerEmail && b.customerEmail)
          return a.customerEmail.localeCompare(b.customerEmail);
        else if (a.customerEmail) return -1;
        else if (b.customerEmail) return 1;
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
            <Tooltip title="Paid">Paid</Tooltip>
          </div>
        </div>
      ),
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
      dataIndex: 'amount',
      width: '5%',
      align: 'center',
      render: (value: number) => `${(value / 100).toFixed(2)}`,
      sorter: (a, b): any => {
        if (a.amount && b.amount) return a.amount - b.amount;
        else if (a.amount) return -1;
        else if (b.amount) return 1;
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
            <Tooltip title="Disco Dollars">Disco Dollars</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Stage">Stage</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'stage',
      width: '12%',
      align: 'center',
      render: (value: string, order, index) => (
        <Select
          loading={orderUpdateList[index]}
          disabled={orderUpdateList[index]}
          defaultValue={value ?? '-'}
          style={{ width: '100%' }}
          onChange={value => handleSelectChange(value, order, index, 'stage')}
          filterOption={filterOption}
          allowClear
          showSearch
        >
          {ordersSettings.map((ordersSetting: any) => (
            <Select.Option
              key={ordersSetting.value}
              value={ordersSetting.value}
            >
              <div style={{ display: 'grid', placeItems: 'stretch' }}>
                <div
                  style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Tooltip title={ordersSetting.name}>
                    {ordersSetting.name}
                  </Tooltip>
                </div>
              </div>
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Int. Status">Int. Status</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'commissionInternalStatus',
      width: '12%',
      align: 'center',
      render: (value: string, order, index) => (
        <Select
          loading={orderUpdateList[index]}
          disabled={orderUpdateList[index]}
          defaultValue={value ?? '-'}
          style={{ width: '100%' }}
          onChange={value =>
            handleSelectChange(value, order, index, 'commissionInternalStatus')
          }
          filterOption={filterOption}
          allowClear
          showSearch
        >
          {ordersSettings.map((ordersSetting: any) => (
            <Select.Option
              key={ordersSetting.value}
              value={ordersSetting.value}
            >
              <div style={{ display: 'grid', placeItems: 'stretch' }}>
                <div
                  style={{
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Tooltip title={ordersSetting.name}>
                    {ordersSetting.name}
                  </Tooltip>
                </div>
              </div>
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
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

  const cartColumns: ColumnsType<Order> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyOrderToClipboard order={id} />,
      align: 'center',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: '15%',
      align: 'center',
      ...getColumnSearchProps('description'),
      render: (value: string) => {
        return (
          <div style={{ display: 'grid', placeItems: 'stretch' }}>
            <div
              style={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              <Tooltip title={value}>{value}</Tooltip>
            </div>
          </div>
        );
      },
      sorter: (a, b): any => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return -1;
        else if (b.description) return 1;
        else return 0;
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      width: '5%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.quantity && b.quantity) return a.quantity - b.quantity;
        else if (a.quantity) return -1;
        else if (b.quantity) return 1;
        else return 0;
      },
    },
    {
      title: 'Price',
      dataIndex: 'originalPrice',
      width: '5%',
      align: 'center',
      render: (value: number) => `${value.toFixed(2)}`,
      sorter: (a, b): any => {
        if (a.originalPrice && b.originalPrice)
          return a.originalPrice - b.originalPrice;
        else if (a.originalPrice) return -1;
        else if (b.originalPrice) return 1;
        else return 0;
      },
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      width: '5%',
      align: 'center',
      render: (value: number) => `${value.toFixed(2)}`,
      sorter: (a, b): any => {
        if (a.discount && b.discount) return a.discount - b.discount;
        else if (a.discount) return -1;
        else if (b.discount) return 1;
        else return 0;
      },
    },
    {
      title: 'Sale Price',
      dataIndex: 'discountedPrice',
      width: '5%',
      align: 'center',
      render: (value: number) => `${value.toFixed(2)}`,
      sorter: (a, b): any => {
        if (a.discountedPrice && b.discountedPrice)
          return a.discountedPrice - b.discountedPrice;
        else if (a.discountedPrice) return -1;
        else if (b.discountedPrice) return 1;
        else return 0;
      },
    },
    {
      title: 'Return Date',
      dataIndex: 'returnDate',
      width: '10%',
      align: 'center',
      render: (value: Date) =>
        value ? (
          <>
            <div>{moment(value).format('DD/MM/YYYY')}</div>
            <div>{moment(value).format('HH:mm')}</div>
          </>
        ) : (
          '-'
        ),
      sorter: (a, b): any => {
        if (a.returnDate && b.returnDate)
          return moment(a.returnDate).unix() - moment(b.returnDate).unix();
        else if (a.returnDate) return -1;
        else if (b.returnDate) return 1;
        else return 0;
      },
    },
    {
      title: 'Return Quantity',
      dataIndex: 'returnQuantity',
      width: '5%',
      align: 'center',
      render: (value: number) => (value ? value : '-'),
      sorter: (a, b): any => {
        if (a.returnQuantity && b.returnQuantity)
          return a.returnQuantity - b.returnQuantity;
        else if (a.returnQuantity) return -1;
        else if (b.returnQuantity) return 1;
        else return 0;
      },
    },
  ];

  const CartTable = () => {
    const validData: any[] = [];
    if (cartTableContent?.product) {
      validData.push({
        id: cartTableContent.product.id,
        description: cartTableContent.product.description,
        quantity: 1,
        originalPrice: cartTableContent.product.originalPrice,
        discount:
          cartTableContent.product.originalPrice -
          cartTableContent.product.discountedPrice,
        discountedPrice: cartTableContent.product.discountedPrice,
        returnDate: cartTableContent.return?.date,
        returnQuantity: cartTableContent.return ? 1 : '-',
      });
    } else {
      cartTableContent?.cart?.brandGroups.forEach(brand =>
        brand.items.forEach(item =>
          validData.push({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            originalPrice: item.totalPrice,
            discount: item.totalPrice - item.totalDiscountedPrice,
            discountedPrice: item.totalDiscountedPrice,
            returnDate: cartTableContent.return?.date,
            returnQuantity: cartTableContent.return?.quantity,
          })
        )
      );
    }

    return (
      <>
        <Table
          className="mt-1"
          rowKey="id"
          columns={cartColumns}
          dataSource={validData}
          pagination={false}
        />
      </>
    );
  };

  useEffect(() => {
    const getBrands = async () => {
      try {
        const { results }: any = await fetchBrands();
        setBrands(results.filter((brand: any) => brand.brandName));
      } catch (e) {
      } finally {
      }
    };
    getBrands();
  }, []);

  const handleChangeBrand = async (_?: string, option?: BaseOptionType) => {
    setBuffer([]);
    const selectedEntity = brands.find(item => item.id === option?.value);
    setBrandId(selectedEntity?.id);
  };

  const getFan = (fanUser: string) => {
    return fans.find(fan => fan.user.includes(fanUser));
  };

  const onChangeFan = async (input?: string, fan?: Fan) => {
    setBuffer([]);
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
          "Warning: Can't filter orders with incomplete Fan Filter! Please select a Fan."
        );
    }
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <>
      {!details && (
        <div className="orders">
          <PageHeader
            title="Orders"
            subTitle={isMobile ? '' : 'List of Orders'}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="sticky-filter-box mb-05"
            gutter={8}
          >
            <Col lg={16} xs={24}>
              <Row gutter={[8, 8]} align="bottom">
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Master Brand</Typography.Title>
                  <Select
                    allowClear
                    onChange={handleChangeBrand}
                    style={{ width: '100%' }}
                    placeholder="Select a Master Brand"
                    value={brandId}
                    disabled={!brands.length || refreshing}
                    showSearch
                    filterOption={filterOption}
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
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Fan Filter</Typography.Title>
                  <MultipleFetchDebounceSelect
                    style={{ width: '100%' }}
                    onInput={getFans}
                    onChange={onChangeFan}
                    onClear={onClearFan}
                    optionMapping={fanOptionMapping}
                    placeholder="Search by Fan E-mail"
                    options={fans}
                    input={fanFilterInput}
                    disabled={!brands.length || refreshing}
                    onInputKeyDown={(event: HTMLInputElement) =>
                      handleKeyDown(event)
                    }
                  ></MultipleFetchDebounceSelect>
                </Col>
              </Row>
            </Col>
            <Col lg={4} xs={24}>
              <Row justify="end">
                <Col>
                  <Button
                    type="primary"
                    onClick={() => setRefreshing(true)}
                    className={isMobile ? 'mt-1' : ''}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={data.length}
            next={loadNext}
            hasMore={page > 0 && !eof}
            loader={
              page !== 0 &&
              loaded && (
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
              className="mt-05"
              scroll={{ x: true, y: 300 }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={refreshing}
              pagination={false}
              expandedRowKeys={expandedRowKeys}
              expandable={{
                onExpand: (expanded, record) => {
                  const keys: string[] = [];
                  if (expanded) {
                    keys.push(record?.id!);
                    setCartTableContent(record);
                  } else {
                    setCartTableContent(undefined);
                  }
                  setExpandedRowKeys(keys);
                },
                expandedRowRender: record => (
                  <>
                    <Row justify="center">
                      <Col span={22}>
                        <Descriptions title="Details">
                          <Descriptions.Item label="Order ID" className="mt-05">
                            {record.id}
                          </Descriptions.Item>
                          <Descriptions.Item label="User">
                            {record.customerEmail}
                          </Descriptions.Item>
                          <Descriptions.Item label="Paid Status">
                            {record.paid ? 'Paid' : 'Not paid'}
                          </Descriptions.Item>
                          <Descriptions.Item label="Order Amount">
                            {((record.amount ?? 0) / 100).toFixed(2)}
                          </Descriptions.Item>
                          <Descriptions.Item label="Date">
                            {moment(record.hCreationDate).format('DD/MM/YYYY')}
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>
                    <Row justify="center" className="mt-15">
                      <Col span={22}>
                        <Descriptions title="Cart">
                          <Descriptions.Item>
                            <CartTable />
                          </Descriptions.Item>
                        </Descriptions>
                      </Col>
                    </Row>
                  </>
                ),
                rowExpandable: record => record.cart || record.product,
              }}
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
