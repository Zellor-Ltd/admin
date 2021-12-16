import { CalendarOutlined, EditOutlined } from '@ant-design/icons';
import { Col, DatePicker, PageHeader, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SelectFan } from 'components/SelectFan';
import { Fan } from 'interfaces/Fan';
import { Transaction } from 'interfaces/Transaction';
import moment from 'moment';
import { useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchWalletTransactions } from 'services/DiscoClubService';
import CopyOrderToClipboard from 'components/CopyOrderToClipboard';

const Transactions: React.FC<RouteComponentProps> = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

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
          <SelectFan
            style={{ width: '100%' }}
            onChange={onChangeFan}
          ></SelectFan>
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
