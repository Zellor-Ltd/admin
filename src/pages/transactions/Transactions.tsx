import { CalendarOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Col,
  DatePicker,
  PageHeader,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Fan } from 'interfaces/Fan';
import { Transaction } from 'interfaces/Transaction';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchFans, fetchWalletTransactions } from 'services/DiscoClubService';
import CopyOrderToClipboard from 'components/CopyOrderToClipboard';
import SimpleSelect from 'components/select/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useRequest } from 'hooks/useRequest';

const Transactions: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFan, setSelectedFan] = useState<Fan | undefined>();
  const [isFetchingFans, setIsFetchingFans] = useState(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [searchFilter, setSearchFilter] = useState<string>();
  const [options, setOptions] = useState<
    { label: string; value: string; key: string }[]
  >([]);

  const fanOptionsMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  const getFans = async () => {
    setIsFetchingFans(true);
    const response = await doFetch(() =>
      fetchFans({
        page: 0,
        query: searchFilter,
      })
    );

    const optionFactory = (option: any) => {
      return {
        label: option[fanOptionsMapping.label],
        value: option[fanOptionsMapping.value],
        key: option[fanOptionsMapping.value],
      };
    };

    setOptions(response.results.map(optionFactory));
    setIsFetchingFans(false);
  };

  useEffect(() => {
    getFans();
  }, []);

  useEffect(() => {
    if (refreshing) {
      setFilteredTransactions([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  const fetchData = async () => {
    if (!transactions.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = transactions.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredTransactions(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyOrderToClipboard order={id} />,
      align: 'center',
    },
    {
      title: 'Creation Time',
      dataIndex: 'hCreationDate',
      width: '15%',
      align: 'left',
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
      sorter: (a, b) =>
        moment(a.hCreationDate).unix() - moment(b.hCreationDate).unix(),
    },
    {
      title: 'Master Brand',
      dataIndex: 'brandName',
      width: '15%',
      align: 'center',
      sorter: (a, b) => {
        return a.brandName.localeCompare(b.brandName);
      },
    },
    {
      title: 'Disco Dollars',
      dataIndex: 'discoDollars',
      width: '15%',
      align: 'center',
      sorter: (a, b) =>
        a.discoDollars && b.discoDollars ? a.discoDollars - b.discoDollars : 0,
    },
    {
      title: 'Disco Gold',
      dataIndex: 'discoGold',
      width: '15%',
      align: 'center',
      sorter: (a, b) =>
        a.discoGold && b.discoGold ? a.discoGold - b.discoGold : 0,
    },
  ];

  const paginateData = () => {
    if (!transactions.length) {
      return;
    }

    const results = transactions.slice(page * 10, page * 10 + 10);

    setFilteredTransactions(prev => [...prev.concat(results)]);

    if (results.length < 10) {
      setEof(true);
    } else {
      setPage(page + 1);
    }
  };

  const onChangeFan = async (value: string, _selectedFan?: any) => {
    setLoading(true);
    if (_selectedFan) {
      setSelectedFan(_selectedFan);
      const { results }: any = await fetchWalletTransactions(_selectedFan.id);
      setTransactions(results);
      setRefreshing(true);
      if (!loaded) setLoaded(true);
    } else {
      setTransactions([]);
    }
    setLoading(false);
  };

  const handleDateChange = (values: any) => {
    if (!values) {
      setFilteredTransactions(transactions);
      return;
    }
    const startDate = moment(values[0], 'DD/MM/YYYY').startOf('day').utc();
    const endDate = moment(values[1], 'DD/MM/YYYY').endOf('day').utc();
    setFilteredTransactions(
      transactions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  const onSearch = (value: string) => {
    setSearchFilter(value);
    getFans();
  };

  return (
    <div className="transactions">
      <PageHeader title="Transactions" subTitle="List of Transactions" />
      <Row
        gutter={8}
        style={{ marginBottom: '20px' }}
        className={'sticky-filter-box'}
      >
        <Col xxl={40} lg={6} xs={18}>
          <Typography.Title level={5}>Fan Filter</Typography.Title>
          <AutoComplete
            style={{ width: '100%' }}
            options={options}
            onSelect={onChangeFan}
            onSearch={onSearch}
            placeholder="Type to search a fan"
          />
        </Col>
      </Row>
      <InfiniteScroll
        dataLength={filteredTransactions.length}
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
          rowKey="id"
          columns={columns}
          dataSource={filteredTransactions}
          loading={loading || refreshing}
          pagination={false}
        />
      </InfiniteScroll>
    </div>
  );
};

export default Transactions;
