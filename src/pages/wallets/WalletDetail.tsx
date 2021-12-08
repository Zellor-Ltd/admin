import { CalendarOutlined } from '@ant-design/icons';
import { Col, DatePicker, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import {
  WalletDetailParams,
  WalletTransaction,
} from 'interfaces/WalletTransactions';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchTransactionsPerBrand } from 'services/DiscoClubService';
import WalletEdit from './WalletEdit';

const WalletDetail: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading: setLoading });
  const initial = location.state as unknown as WalletDetailParams;

  const {
    // arrayList: wallets,
    setArrayList: setTransactions,
    filteredArrayList: filteredTransactions,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<WalletTransaction>([]);

  const getResources = async () => {
    const { results } = await doFetch(() =>
      fetchTransactionsPerBrand(initial.fan.id, initial.brand.id)
    );
    setTransactions(results);

    console.log(results)
  };

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<WalletTransaction> = [
    {
      title: 'Date Time',
      dataIndex: 'hCreationDate',
      width: '20%',
      align: 'left',
      filterIcon: <CalendarOutlined />,
      filterDropdown: () => (
        <DatePicker.RangePicker
          style={{ padding: 8 }}
          onChange={handleDateChange}
        />
      ),
      render: (value: Date) =>
        `${moment(value).format('DD/MM/YYYY')} ${moment(value).format(
          'HH:mm:ss'
        )}`,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: '12%',
    },
    {
      title: 'Amount',
      dataIndex: 'discoDollars',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Who',
      width: '20%',
      align: 'right',
      dataIndex: 'addedBy',
      render: (value: string, record) =>
        value === initial.fan.id ? initial.fan.user : "admin",
    },
  ];

  const handleDateChange = (values: any) => {
    if (!values) {
      removeFilterFunction('creationDate');
      return;
    }
    const startDate = moment(values[0], 'DD/MM/YYYY').startOf('day').utc();
    const endDate = moment(values[1], 'DD/MM/YYYY').endOf('day').utc();
    addFilterFunction('creationDate', (transactions: WalletTransaction[]) =>
      transactions.filter(({ hCreationDate }) => {
        return moment(hCreationDate).utc().isBetween(startDate, endDate);
      })
    );
  };

  return (
    <div className="walletdetail">
      <PageHeader
        title={`${initial.fan.name}/${initial.brand.name} Transactions`}
      />
      <Row align="bottom" justify="space-between">
        <Col lg={24} xs={24}>
          <Row gutter={8}>
            <Col lg={6} xs={12}>
              <Typography.Text strong>Fan: {initial.fan.user}</Typography.Text>
            </Col>
            <Col lg={6} xs={12}>
              <Typography.Text strong>
                Master Brand: {initial.brand.name}
              </Typography.Text>
            </Col>
            <WalletEdit
              disabled={false}
              fanId={initial.fan.id}
              brandId={initial.brand.id}
              getResources={getResources}
            />
          </Row>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredTransactions}
        loading={loading}
      />
    </div>
  );
};

export default WalletDetail;
