import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Col, PageHeader, Popconfirm, Row, Spin, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
import { useRequest } from 'hooks/useRequest';
import { PromoDisplay } from 'interfaces/PromoDisplay';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deletePromoDisplay,
  fetchPromoDisplays,
} from 'services/DiscoClubService';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import scrollIntoView from 'scroll-into-view';
import PromoDisplayDetail from './PromoDisplayDetail';
import InfiniteScroll from 'react-infinite-scroll-component';

const PromoDisplays: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentPromoDisplay, setCurrentPromoDisplay] =
    useState<PromoDisplay>();
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [filteredPromoDisplays, setFilteredPromoDisplays] = useState<
    PromoDisplay[]
  >([]);

  const {
    setArrayList: setPromoDisplays,
    filteredArrayList: filteredContent,
    addFilterFunction,
    removeFilterFunction,
  } = useFilter<PromoDisplay>([]);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getPromoDisplays();
  };

  const getPromoDisplays = async () => {
    const { results } = await doFetch(fetchPromoDisplays);
    setPromoDisplays(results);
    setRefreshing(true);
  };

  const fetchData = () => {
    if (!filteredContent.length) return;

    const pageToUse = refreshing ? 0 : page;
    const results = filteredContent.slice(pageToUse * 10, pageToUse * 10 + 10);

    setPage(pageToUse + 1);
    setFilteredPromoDisplays(prev => [...prev.concat(results)]);

    if (results.length < 10) setEof(true);
  };

  useEffect(() => {
    if (refreshing) {
      setFilteredPromoDisplays([]);
      setEof(false);
      fetchData();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editPromoDisplay = (index: number, promoDisplay?: PromoDisplay) => {
    setLastViewedIndex(index);
    setCurrentPromoDisplay(promoDisplay);
    setDetails(true);
  };

  const deleteItem = async (id: string, index: number) => {
    await doRequest(() => deletePromoDisplay({ id }));
    setPromoDisplays(prev => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ]);
  };

  const columns: ColumnsType<PromoDisplay> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '6%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Shop Display ID',
      dataIndex: 'id',
      width: '20%',
      render: (value: string, record: PromoDisplay, index: number) => (
        <Link
          to={location.pathname}
          onClick={() => editPromoDisplay(index, record)}
        >
          {value}
        </Link>
      ),
    },
    {
      title: 'Display Start Date',
      dataIndex: 'displayStartDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
    },
    {
      title: 'Display Expire Date',
      dataIndex: 'displayExpireDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
        </>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record: PromoDisplay, index: number) => (
        <>
          <Link
            to={location.pathname}
            onClick={() => editPromoDisplay(index, record)}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const searchFilterFunction = (filterText: string) => {
    if (!filterText) {
      removeFilterFunction('promoId');
      setRefreshing(true);
      return;
    }
    addFilterFunction('promoId', promoDisplays =>
      promoDisplays.filter(promoDisplay =>
        promoDisplay.id.toUpperCase().includes(filterText.toUpperCase())
      )
    );
    setRefreshing(true);
  };

  const refreshItem = (record: PromoDisplay) => {
    filteredPromoDisplays[lastViewedIndex] = record;
    setPromoDisplays([...filteredPromoDisplays]);
  };

  const onSavePromoDisplay = (record: PromoDisplay) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelPromoDisplay = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Shop Display"
            subTitle="List of Shop Display"
            extra={[
              <Button
                key="1"
                onClick={() => editPromoDisplay(filteredPromoDisplays.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8}>
            <Col lg={8} xs={16}>
              <SearchFilter
                filterFunction={searchFilterFunction}
                label="Search by ID"
              />
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={filteredPromoDisplays.length}
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
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={filteredPromoDisplays}
              loading={loading || refreshing}
              pagination={false}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <PromoDisplayDetail
          promoDisplay={currentPromoDisplay}
          onSave={onSavePromoDisplay}
          onCancel={onCancelPromoDisplay}
        />
      )}
    </>
  );
};

export default PromoDisplays;
