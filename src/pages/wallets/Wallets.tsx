import { Col, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
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
  fetchFans,
} from 'services/DiscoClubService';
import WalletEdit from './WalletEdit';
import scrollIntoView from 'scroll-into-view';
import WalletDetail from './WalletDetail';

const Wallets: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand>();
  const { doFetch } = useRequest({ setLoading: setLoading });
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedFan, setSelectedFan] = useState<Fan | undefined>();
  const [isFetchingFans, setIsFetchingFans] = useState(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);

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

  const {
    arrayList: wallets,
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
      } catch (e) {}
    };

    getFans();
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editWallet = (index: number) => {
    setLastViewedIndex(index);
    setDetails(true);
  };

  const onResetWallet = (record?: Wallet) => {
    if (record) {
      const index = wallets.indexOf(
        wallets.find(item => item.brandId === record.brandId) as Wallet
      );
      setWallets(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    }
  };

  const onSaveWallet = (balanceToAdd: number, record?: Wallet) => {
    if (record) {
      record.discoDollars += balanceToAdd;
    }
    refreshItem(balanceToAdd, record);
  };

  const refreshItem = (balanceToAdd: number, record?: Wallet) => {
    if (record) {
      wallets[
        wallets.indexOf(
          wallets.find(item => item.brandId === record.brandId) as Wallet
        )
      ] = record;
    } else {
      wallets.push({
        discoDollars: balanceToAdd,
        discoGold: 0,
        brandId: selectedBrand?.id as string,
        totalProducts: '',
        brandName: selectedBrand?.brandName as string,
        brandTxtColor: selectedBrand?.brandTxtColor as string,
        brandLogoUrl: selectedBrand?.brandLogoUrl as string,
        brandCardUrl: selectedBrand?.brandCardUrl as string,
      });
    }
    setWallets([...wallets]);
  };

  const columns: ColumnsType<Wallet> = [
    {
      title: 'Master Brand',
      dataIndex: 'brandName',
      width: '40%',
      render: (value: string, record: Wallet, index: number) => (
        <Link
          to={{
            pathname: location.pathname,
            state: {
              fan: selectedFan,
              brand: {
                id: record.brandId,
                discoDollars: record.discoDollars,
                discoGold: record.discoGold,
                name: record.brandName,
                brandTxtColor: record.brandTxtColor,
                brandLogoUrl: record.brandLogoUrl,
                brandCardUrl: record.brandCardUrl,
              },
            } as WalletDetailParams,
          }}
          onClick={() => editWallet(index)}
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

  const onChangeFan = async (_selectedFan?: Fan) => {
    if (_selectedFan) {
      const { balance }: any = await doFetch(
        () => fetchBalancePerBrand(_selectedFan.id),
        true
      );
      setWallets(balance);
    } else {
      setWallets([]);
    }
    setSelectedFan(_selectedFan);
  };

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    setSelectedBrand(_selectedBrand);
    if (!_selectedBrand) {
      removeFilterFunction('brandName');
      return;
    }
    addFilterFunction('brandName', wallets =>
      wallets.filter(wallet => wallet.brandName === _selectedBrand.brandName)
    );
  };

  const getResources = async () => {
    if (selectedFan && selectedBrand) {
      const { results } = await doFetch(() =>
        fetchTransactionsPerBrand(selectedFan.id, selectedBrand.id)
      );
      setTransactions(results);
      onChangeFan(selectedFan);
    }
  };

  const onCancelWallet = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div className="wallets">
          <PageHeader title="Fan Wallets" subTitle="List of fan wallets" />
          <Row align="bottom" justify="space-between">
            <Col span={24}>
              <Row gutter={8} align="bottom">
                <Col span={4}>
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
                {selectedFan && (
                  <Col span={4}>
                    <Typography.Title level={5}>Master Brand</Typography.Title>
                    <SimpleSelect
                      data={brands}
                      onChange={(_, brand) => onChangeBrand(brand)}
                      style={{ width: '100%', marginBottom: '16px' }}
                      selectedOption={selectedBrand?.brandName}
                      optionsMapping={optionsMapping}
                      placeholder={'Select a master brand'}
                      loading={isFetchingBrands}
                      disabled={isFetchingBrands}
                      allowClear={true}
                    ></SimpleSelect>
                  </Col>
                )}
                <Col span={6} style={{ position: 'relative', top: '8px' }}>
                  <WalletEdit
                    disabled={!selectedFan || !selectedBrand}
                    fanId={selectedFan?.id}
                    brandId={selectedBrand?.id}
                    wallet={filteredWallets.find(
                      item => item.brandId === selectedBrand?.id
                    )}
                    onSave={onSaveWallet}
                    onReset={onResetWallet}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={filteredWallets}
            loading={loading}
          />
        </div>
      )}
      {details && (
        <WalletDetail
          location={location}
          onCancel={onCancelWallet}
          onSave={onSaveWallet}
          onReset={onResetWallet}
        />
      )}
    </>
  );
};

export default Wallets;
