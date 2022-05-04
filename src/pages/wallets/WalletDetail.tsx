import { CalendarOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  PageHeader,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import {
  WalletDetailParams,
  WalletTransaction,
} from 'interfaces/WalletTransactions';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { fetchTransactionsPerBrand } from 'services/DiscoClubService';
import WalletEdit from './WalletEdit';
import * as H from 'history';
import { Wallet } from 'interfaces/Wallet';
import InfiniteScroll from 'react-infinite-scroll-component';
interface WalletDetailProps {
  location: H.Location<H.LocationState>;
  onCancel?: () => void;
  onSave?: (value: number, record?: Wallet) => void;
  onReset?: (record?: Wallet) => void;
}

const WalletDetail: React.FC<WalletDetailProps> = ({
  location,
  onCancel,
  onSave,
  onReset,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading: setLoading });
  const initial = location.state as unknown as WalletDetailParams;
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filter, setFilter] = useState<any[]>([]);

  const wallet = initial
    ? {
        discoGold: initial.brand.discoGold,
        discoDollars: initial.brand.discoDollars,
        brandId: initial.brand.id,
        totalProducts: '',
        brandName: initial.brand.name,
        brandTxtColor: initial.brand.brandTxtColor,
        brandLogoUrl: initial.brand.brandLogoUrl,
        brandCardUrl: initial.brand.brandCardUrl,
      }
    : undefined;

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    const { results } = await doFetch(() =>
      fetchTransactionsPerBrand(initial.fan.id, initial.brand.id)
    );
    setTransactions(results);
    setRefreshing(true);
  };

  const fetchData = () => {
    if (!transactions.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = transactions.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setTransactions(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setTransactions([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (search(transactions).length < 10) setEof(true);
  }, [transactions]);

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
          onChange={values => setFilter(values as any)}
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
        value === initial.fan.id ? initial.fan.user : 'admin',
    },
  ];

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

  const onResetWallet = () => {
    setTransactions([]);
    onReset?.(wallet);
  };

  const onSaveWallet = (balanceToAdd: number) => {
    transactions.push({
      discoDollars: balanceToAdd,
      hCreationDate: moment(),
      addedBy: 'admin',
    });
    setTransactions([...transactions]);
    onSave?.(balanceToAdd, wallet);
  };

  return (
    <div className="walletdetail">
      <PageHeader
        title={
          initial
            ? `${initial.fan.name}/${initial.brand.name} Transactions`
            : 'New Item'
        }
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
          </Row>
          <Row justify="space-between">
            <Col lg={20} xs={12}>
              <WalletEdit
                disabled={false}
                fanId={initial.fan.id}
                brandId={initial.brand.id}
                wallet={initial as unknown as Wallet}
                onSave={onSaveWallet}
                onReset={onResetWallet}
              />
            </Col>
            <Col>
              <Button type="primary" onClick={() => onCancel?.()}>
                Go Back
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <InfiniteScroll
        dataLength={transactions.length}
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
          dataSource={search(transactions)}
          loading={loading || refreshing}
          pagination={false}
        />
      </InfiniteScroll>
    </div>
  );
};

export default WalletDetail;
