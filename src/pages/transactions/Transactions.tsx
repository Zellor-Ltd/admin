import { CalendarOutlined } from '@ant-design/icons';
import {
  Col,
  DatePicker,
  message,
  PageHeader,
  Row,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Transaction } from 'interfaces/Transaction';
import moment from 'moment';
import { useContext, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { RouteComponentProps } from 'react-router-dom';
import { fetchFans, fetchWalletTransactions } from 'services/DiscoClubService';
import CopyOrderToClipboard from 'components/CopyOrderToClipboard';
import { SelectOption } from 'interfaces/SelectOption';
import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';
import { Fan } from 'interfaces/Fan';

const Transactions: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [fans, setFans] = useState<Fan[]>([]);
  const [userInput, setUserInput] = useState<string>();

  const fanOptionMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  const { isMobile } = useContext(AppContext);

  const getFans = async (input?: string, loadNextPage?: boolean) => {
    setUserInput(input);
    const pageToUse = !!!loadNextPage ? 0 : optionsPage;
    const response: any = await fetchFans({
      page: pageToUse,
      query: input,
    });
    setOptionsPage(pageToUse + 1);

    if (pageToUse === 0) setFans(response.results);
    else setFans(prev => [...prev.concat(response.results)]);

    return response.results;
  };

  const columns: ColumnsType<Transaction> = [
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
            <Tooltip title="Creation Time">Creation Time</Tooltip>
          </div>
        </div>
      ),
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
            <Tooltip title="Master Brand">Master Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'brandName',
      width: '15%',
      align: 'center',
      sorter: (a, b) => {
        if (a.brandName && b.brandName)
          return a.brandName.localeCompare(b.brandName);
        else if (a.brandName) return 1;
        else if (b.brandName) return -1;
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
      width: '15%',
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
            <Tooltip title="Disco Gold">Disco Gold</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'discoGold',
      width: '15%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.discoGold && b.discoGold) return a.discoGold - b.discoGold;
        else if (a.discoGold) return -1;
        else if (b.discoGold) return 1;
        else return 0;
      },
    },
  ];

  const handleChangeFan = async (value?: string, _selectedFan?: any) => {
    setLoading(true);
    if (_selectedFan) {
      const { results }: any = await fetchWalletTransactions(_selectedFan.id);
      setTransactions(results);
      if (!loaded) setLoaded(true);
      setUserInput(value);
    } else {
      setUserInput('');
      setTransactions([]);
      getFans();
    }
    setLoading(false);
  };

  const handleDateChange = (values: any) => {
    if (!values) {
      setTransactions(transactions);
      return;
    }
    const startDate = moment(values[0], 'DD/MM/YYYY').startOf('day').utc();
    const endDate = moment(values[1], 'DD/MM/YYYY').endOf('day').utc();
    setTransactions(
      transactions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      const selectedEntity = fans?.find(item => item.user === userInput);
      if (!selectedEntity)
        message.warning(
          "Warning: Can't list transactions with incomplete Fan Filter! Please select a Fan."
        );
    }
  };

  return (
    <div className="transactions" style={{ overflow: 'clip', height: '100%' }}>
      <PageHeader
        title="Transactions"
        subTitle={isMobile ? '' : 'List of Transactions'}
      />
      <Row gutter={8} className="sticky-filter-box mb-05">
        <Col xxl={40} lg={4} xs={24}>
          <Typography.Title level={5}>Fan Filter</Typography.Title>
          <MultipleFetchDebounceSelect
            disabled={loading}
            style={{ width: '100%' }}
            onInput={getFans}
            onChange={handleChangeFan}
            onClear={handleChangeFan}
            optionMapping={fanOptionMapping}
            placeholder="Search by Fan E-mail"
            input={userInput}
            options={fans}
            onInputKeyDown={(event: HTMLInputElement) => handleKeyDown(event)}
          ></MultipleFetchDebounceSelect>
        </Col>
      </Row>
      <div className="custom-table">
        <Table
          scroll={{ x: true, y: '30em' }}
          rowKey="id"
          columns={columns}
          dataSource={transactions}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Transactions;
