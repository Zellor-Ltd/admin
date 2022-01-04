import { CalendarOutlined } from '@ant-design/icons';
import { Col, DatePicker, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { Fan } from 'interfaces/Fan';
import { Transaction } from 'interfaces/Transaction';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchFans, fetchWalletTransactions } from 'services/DiscoClubService';
import CopyOrderToClipboard from 'components/CopyOrderToClipboard';
import SimpleSelect from 'components/SimpleSelect';
import { SelectOption } from 'interfaces/SelectOption';

const Transactions: React.FC<RouteComponentProps> = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [selectedFan, setSelectedFan] = useState<Fan | undefined>();
  const [isFetchingFans, setIsFetchingFans] = useState(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  const fanOptionsMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  useEffect(() => {
    const getFans = async () => {
      setIsFetchingFans(true);
      const response: any = await fetchFans();
      setFans(response.results);
      setIsFetchingFans(false);
    };
    getFans();
  }, []);

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
    },
    {
      title: 'Master Brand',
      dataIndex: 'brandName',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Disco Dollars',
      dataIndex: 'discoDollars',
      width: '15%',
      align: 'center',
    },
    {
      title: 'Disco Gold',
      dataIndex: 'discoGold',
      width: '15%',
      align: 'center',
    },
  ];

  const onChangeFan = async (_selectedFan: Fan) => {
    setSelectedFan(_selectedFan);
    setTableLoading(true);
    const { results }: any = await fetchWalletTransactions(_selectedFan.id);
    setTableLoading(false);
    setTransactions(results);
    setFilteredTransactions(results);
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

  return (
    <div className="transactions">
      <PageHeader title="Transactions" subTitle="List of Transactions" />
      <Row gutter={8} style={{ marginBottom: '20px' }}>
        <Col xxl={40} lg={6} xs={18}>
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
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTransactions}
        loading={tableLoading}
      />
    </div>
  );
};

export default Transactions;
