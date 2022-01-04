import { Col, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SelectFan } from 'components/SelectFan';
import SimpleSelect from 'components/SimpleSelect';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Fan } from 'interfaces/Fan';
import { SelectOption } from 'interfaces/SelectOption';
import { Wallet } from 'interfaces/Wallet';
import { WalletTransaction } from 'interfaces/WalletTransactions';
import { WalletDetailParams } from 'interfaces/WalletTransactions';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  fetchBrands,
  fetchBalancePerBrand,
  fetchTransactionsPerBrand,
} from 'services/DiscoClubService';
import WalletEdit from './WalletEdit';

const Wallets: React.FC<RouteComponentProps> = ({ location }) => {
  const detailsPathname = `${location.pathname}/wallet`;
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFan, setSelectedFan] = useState<Fan>();
  const [selectedBrand, setSelectedBrand] = useState<Brand>();
  const { doFetch } = useRequest({ setLoading: setLoading });
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  const optionsMapping: SelectOption = {
    key: 'id',
    label: 'brandName',
    value: 'id',
  };

  const {
    // arrayList: wallets,
    setArrayList: setWallets,
    filteredArrayList: filteredWallets,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Wallet>([]);

  const {
    // arrayList: wallets,
    setArrayList: setTransactions,
    filteredArrayList: filteredTransactions,
  } = useFilter<WalletTransaction>([]);

  useEffect(() => {
    const getBrands = async () => {
      try {
        setIsFetchingBrands(true);
        const { results }: any = await fetchBrands();
        setBrands(results.filter((brand: any) => brand.brandName));
        setIsFetchingBrands(false);
      } catch (e) {}
    };
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns: ColumnsType<Wallet> = [
    {
      title: 'Master Brand',
      dataIndex: 'brandName',
      width: '40%',
      render: (value: string, record: Wallet) => (
        <Link
          to={{
            pathname: detailsPathname,
            state: {
              fan: selectedFan,
              brand: {
                id: record.brandId,
                discoDollars: record.discoDollars,
                discoGold: record.discoGold,
                name: record.brandName,
              },
            } as WalletDetailParams,
          }}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'DD Balance',
      dataIndex: 'discoDollars',
      width: '15%',
      align: 'right',
    },
  ];

  const onChangeFan = async (_selectedFan: Fan) => {
    const { balance }: any = await doFetch(
      () => fetchBalancePerBrand(_selectedFan.id),
      true
    );
    setWallets(balance);
    setSelectedFan(_selectedFan);
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    if (!_selectedBrand) {
      removeFilterFunction('brandName');
      return;
    }
    addFilterFunction('brandName', wallets =>
      wallets.filter(wallet => wallet.brandName === _selectedBrand.brandName)
    );
    setSelectedBrand(_selectedBrand);
  };

  const getResources = async () => {
    if (selectedFan && selectedBrand) {
      const { results } = await doFetch(() =>
        fetchTransactionsPerBrand(selectedFan.id, selectedBrand.id)
      );
      setTransactions(results);
    }
  };

  return (
    <div className="wallets">
      <PageHeader title="Fan Wallets" subTitle="List of fan wallets" />
      <Row align="bottom" justify="space-between">
        <Col span={24}>
          <Row gutter={8} align="bottom">
            <Col span={4}>
              <SelectFan
                onChange={onChangeFan}
                style={{ width: '100%' }}
                allowClear={false}
              />
            </Col>
            {selectedFan && (
              <Col span={4}>
                <Typography.Title level={5}>Master Brand</Typography.Title>
                <SimpleSelect
                  data={brands}
                  onChange={(_, brand) => onChangeBrand(brand)}
                  style={{ width: '100%', marginBottom: '16px' }}
                  selectedOption={''}
                  optionsMapping={optionsMapping}
                  placeholder={'Select a master brand'}
                  loading={isFetchingBrands}
                  disabled={isFetchingBrands}
                  showSearch={true}
                  allowClear={true}
                ></SimpleSelect>
              </Col>
            )}
            <Col span={6} style={{ position: 'relative', top: '8px' }}>
              <WalletEdit
                disabled={!selectedFan || !selectedBrand}
                fanId={selectedFan?.id}
                brandId={selectedBrand?.id}
                getResources={getResources}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredWallets}
        loading={loading}
      />
    </div>
  );
};

export default Wallets;
