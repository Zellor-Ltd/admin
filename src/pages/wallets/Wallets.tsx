/* eslint-disable react-hooks/exhaustive-deps */
import { Col, PageHeader, Row, Table, Tooltip, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import SimpleSelect from 'components/select/SimpleSelect';
import { Brand } from 'interfaces/Brand';
import { Fan } from 'interfaces/Fan';
import { SelectOption } from 'interfaces/SelectOption';
import { Wallet } from 'interfaces/Wallet';
import { WalletDetailParams } from 'interfaces/WalletTransactions';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  fetchBalancePerBrand,
  fetchBrands,
  fetchFans,
} from 'services/DiscoClubService';
import WalletEdit from './WalletEdit';
import scrollIntoView from 'scroll-into-view';
import WalletDetail from './WalletDetail';
import MultipleFetchDebounceSelect from '../../components/select/MultipleFetchDebounceSelect';

const Wallets: React.FC<RouteComponentProps> = ({ location }) => {
  const [selectedBrand, setSelectedBrand] = useState<Brand>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedFan, setSelectedFan] = useState<Fan | undefined>();
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [filter, setFilter] = useState<string>('');
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [fans, setFans] = useState<Fan[]>([]);
  const [userInput, setUserInput] = useState<string>();
  const { isMobile } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  const optionMapping: SelectOption = {
    key: 'id',
    label: 'name',
    value: 'id',
  };

  const fanOptionMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  useEffect(() => {
    const getBrands = async () => {
      try {
        const { results }: any = await fetchBrands();
        setBrands(results.filter((brand: any) => brand.name));
      } catch (e) {}
    };

    getBrands();
  }, []);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details, wallets]);

  const handleEditWallet = (index: number) => {
    setLastViewedIndex(index);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleResetWallet = (record?: Wallet) => {
    if (record) {
      const index = wallets.indexOf(
        wallets.find(item => item.brandId === record.brandId) as Wallet
      );
      setWallets(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    }
  };

  const handleSaveWallet = (balanceToAdd: number, record?: Wallet) => {
    if (record) {
      const updatedValue = (record.discoDollars += balanceToAdd);
      wallets[wallets.indexOf(record)] = {
        ...record,
        discoDollars: updatedValue,
      };
    } else {
      wallets.push({
        discoDollars: balanceToAdd,
        discoGold: 0,
        brandId: selectedBrand?.id as string,
        totalProducts: '',
        name: selectedBrand?.name as string,
      });
    }
    setWallets([...wallets]);
  };

  const handleCancelWallet = () => {
    setDetails(false);
  };

  const columns: ColumnsType<Wallet> = [
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
            <Tooltip title="Client">Client</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
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
                name: record.name,
                brandTxtColor: record.brandTxtColor,
                logoUrl: record.logoUrl,
                brandCardUrl: record.brandCardUrl,
              },
            } as WalletDetailParams,
          }}
          onClick={() => handleEditWallet(index)}
        >
          {value}
        </Link>
      ),
      sorter: (a, b) => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return 1;
        else if (b.name) return -1;
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
            <Tooltip title="DD Balance">DD Balance</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'discoDollars',
      width: '15%',
      align: 'right',
      sorter: (a, b): any => {
        if (a.discoDollars && b.discoDollars)
          return a.discoDollars - b.discoDollars;
        else if (a.discoDollars) return -1;
        else if (b.discoDollars) return 1;
        else return 0;
      },
    },
  ];

  const handleChangeBrand = (brand?: Brand) => {
    setFilter(brand?.name ?? '');
    setSelectedBrand(brand);
  };

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

  const handleChangeFan = async (value?: string, option?: any) => {
    if (option) {
      const { balance }: any = await fetchBalancePerBrand(option.id);
      const balanceWithKeys = balance.map(item => {
        return { ...item, key: item.brandId };
      });
      setWallets(balanceWithKeys as any[]);

      setSelectedFan(fans.find(fan => fan.user === value));
      setUserInput(value);
    } else {
      setWallets([]);
      setSelectedFan(undefined);
    }
  };

  const handleClearFan = () => {
    setWallets([]);
    setUserInput('');
    setSelectedFan(undefined);
    getFans();
  };

  const search = rows => {
    return rows?.filter(row => row.name?.indexOf(filter) > -1);
  };

  return (
    <div style={{ overflow: 'clip', height: '100%' }}>
      {!details && (
        <>
          <PageHeader
            title="Fan Wallets"
            subTitle={isMobile ? '' : 'List of Fan wallets'}
          />
          <Row align="bottom" justify="space-between" className="mb-05">
            <Col span={24}>
              <Row
                gutter={8}
                align="bottom"
                justify={isMobile ? 'end' : undefined}
              >
                <Col lg={4} xs={24}>
                  <Typography.Title level={5}>Fan Filter</Typography.Title>
                  <MultipleFetchDebounceSelect
                    style={{ width: '100%' }}
                    disabled={!brands.length}
                    input={userInput}
                    onInput={getFans}
                    onChange={handleChangeFan}
                    optionMapping={fanOptionMapping}
                    placeholder="Select a Fan"
                    options={fans}
                    onClear={handleClearFan}
                  ></MultipleFetchDebounceSelect>
                </Col>
                {selectedFan && (
                  <Col lg={4} xs={24} className={isMobile ? 'mt-05' : ''}>
                    <Typography.Title level={5}>Client</Typography.Title>
                    <SimpleSelect
                      showSearch
                      data={brands}
                      onChange={(_, brand) => handleChangeBrand(brand)}
                      style={{ width: '100%' }}
                      selectedOption={selectedBrand?.name}
                      optionMapping={optionMapping}
                      placeholder="Select a Client"
                      disabled={!brands.length}
                      allowClear
                    ></SimpleSelect>
                  </Col>
                )}
                <Col
                  lg={6}
                  xs={24}
                  style={
                    isMobile
                      ? { position: 'relative', top: '24px', padding: 0 }
                      : { position: 'relative', top: '24px' }
                  }
                >
                  <WalletEdit
                    disabled={!selectedFan || !selectedBrand}
                    fanId={selectedFan?.id}
                    brandId={selectedBrand?.id}
                    wallet={search(wallets)?.find(
                      item => item.brandId === selectedBrand?.id
                    )}
                    onSave={handleSaveWallet}
                    onReset={handleResetWallet}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="custom-table">
            <Table
              className="mt-1"
              scroll={{ x: true, y: '27em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="key"
              columns={columns}
              dataSource={search(wallets)}
              pagination={false}
            />
          </div>
        </>
      )}
      {details && (
        <WalletDetail
          location={location}
          onCancel={handleCancelWallet}
          onSave={handleSaveWallet}
          onReset={handleResetWallet}
        />
      )}
    </div>
  );
};

export default Wallets;
