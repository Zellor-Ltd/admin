import {
  AutoComplete,
  Col,
  PageHeader,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import SimpleSelect from 'components/select/SimpleSelect';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { Brand } from 'interfaces/Brand';
import { Fan } from 'interfaces/Fan';
import { SelectOption } from 'interfaces/SelectOption';
import { Wallet } from 'interfaces/Wallet';
import { WalletDetailParams } from 'interfaces/WalletTransactions';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  fetchBalancePerBrand,
  fetchBrands,
  fetchFans,
} from 'services/DiscoClubService';
import WalletEdit from './WalletEdit';
import scrollIntoView from 'scroll-into-view';
import WalletDetail from './WalletDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const Wallets: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand>();
  const { doFetch } = useRequest({ setLoading: setLoading });
  const [isFetchingBrands, setIsFetchingBrands] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedFan, setSelectedFan] = useState<Fan | undefined>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [filteredWallets, setFilteredWallets] = useState<Wallet[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>();
  const [options, setOptions] = useState<
    { label: string; value: string; key: string }[]
  >([]);

  const {
    arrayList: wallets,
    setArrayList: setWallets,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<Wallet>([]);

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

  const onChangeFan = async (value: string, _selectedFan?: any) => {
    if (_selectedFan) {
      const { balance }: any = await doFetch(
        () => fetchBalancePerBrand(_selectedFan.id),
        true
      );
      setWallets(balance);
      setPage(0);
    } else {
      setWallets([]);
    }
    setSelectedFan(_selectedFan);
  };

  useEffect(() => {
    setFilteredWallets([]);
    setEof(false);
    updateDisplayedArray();
  }, [filteredContent, page]);

  const updateDisplayedArray = () => {
    if (!filteredContent.length) return;

    const results = filteredContent.slice(page * 10, page * 10 + 10);
    setFilteredWallets(prev => [...prev.concat(results)]);

    if (results.length < 10) {
      setEof(true);
    } else {
      setPage(page + 1);
    }
  };

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
  }, []);

  const getFans = async () => {
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
  };

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

  const onChangeBrand = async (_selectedBrand: Brand | undefined) => {
    setSelectedBrand(_selectedBrand);
    if (!_selectedBrand) {
      removeFilterFunction('brandName');
      setPage(0);
      return;
    }
    addFilterFunction('brandName', wallets =>
      wallets.filter(wallet => wallet.brandName === _selectedBrand.brandName)
    );
    setPage(0);
  };

  const onCancelWallet = () => {
    setDetails(false);
  };

  const onSearch = (value: string) => {
    setSearchFilter(value);
    getFans();
  };

  return (
    <>
      {!details && (
        <div className="wallets">
          <PageHeader title="Fan Wallets" subTitle="List of fan wallets" />
          <Row
            align="bottom"
            justify="space-between"
            className={'sticky-filter-box'}
          >
            <Col span={24}>
              <Row gutter={8} align="bottom">
                <Col span={4}>
                  <Typography.Title level={5}>Fan Filter</Typography.Title>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={options}
                    onSelect={onChangeFan}
                    onSearch={onSearch}
                    placeholder="Type to search a fan"
                  />
                </Col>
                {selectedFan && (
                  <Col span={4}>
                    <Typography.Title level={5}>Master Brand</Typography.Title>
                    <SimpleSelect
                      data={brands}
                      onChange={(_, brand) => onChangeBrand(brand)}
                      style={{ width: '100%' }}
                      selectedOption={selectedBrand?.brandName}
                      optionsMapping={optionsMapping}
                      placeholder={'Select a master brand'}
                      loading={isFetchingBrands}
                      disabled={isFetchingBrands}
                      allowClear={true}
                    ></SimpleSelect>
                  </Col>
                )}
                <Col span={6} style={{ position: 'relative', top: '23px' }}>
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
          <InfiniteScroll
            dataLength={filteredWallets.length}
            next={updateDisplayedArray}
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
              dataSource={filteredWallets}
              loading={loading}
              pagination={false}
            />
          </InfiniteScroll>
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
