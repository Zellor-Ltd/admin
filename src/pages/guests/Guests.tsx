import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Col,
  PageHeader,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import { useRequest } from 'hooks/useRequest';
import { Fan } from 'interfaces/Fan';
import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchGuests } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import GuestDetail from './GuestDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';
import { SelectOption } from 'interfaces/SelectOption';

const tagColorByPermission: any = {
  Admin: 'green',
  Temp: 'blue',
  Fan: '',
};

const Guests: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentGuest, setCurrentGuest] = useState<Fan>();
  const { doFetch } = useRequest({ setLoading });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [guests, setGuests] = useState<Fan[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>();
  const [options, setOptions] = useState<
    { label: string; value: string; key: string }[]
  >([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fanOptionsMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  useEffect(() => {
    if (refreshing) {
      setGuests([]);
      fetchFans();
      setEof(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const getResources = async () => {
    setRefreshing(true);
    setLoaded(true);
  };

  const fetchFans = async () => {
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchGuests({
        page: pageToUse,
        query: searchFilter,
      })
    );

    setPage(pageToUse + 1);
    if (response.results.length < 30) setEof(true);

    const optionFactory = (option: any) => {
      return {
        label: option[fanOptionsMapping.label],
        value: option[fanOptionsMapping.value],
        key: option[fanOptionsMapping.value],
      };
    };

    setOptions(response.results.map(optionFactory));

    setGuests(prev => [...prev.concat(response.results)]);
  };

  const updateDisplayedArray = () => {
    if (!guests.length) return;
    fetchFans();
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

  const viewGuest = (index: number, fan?: Fan) => {
    setLastViewedIndex(index);
    setCurrentGuest(fan);
    setDetails(true);
  };

  const columns: ColumnsType<Fan> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '10%',
      render: id => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'userName',
      width: '25%',
      align: 'center',
      render: (value, record: Fan, index: number) => (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            <Link
              to={location.pathname}
              onClick={() => viewGuest(index, record)}
            >
              {value}
            </Link>
          </div>
        </div>
      ),
      sorter: (a, b): any => {
        if (a.userName && b.userName)
          return a.userName.localeCompare(b.userName);
        else if (a.userName) return -1;
        else if (b.userName) return 1;
        else return 0;
      },
    },
    {
      title: 'Creation',
      dataIndex: 'hCreationDate',
      width: '15%',
      align: 'center',
      render: (value: Date) => (
        <>
          <div>{moment(value).format('DD/MM/YYYY')}</div>
          <div>{moment(value).format('HH:mm')}</div>
        </>
      ),
      sorter: (a, b): any => {
        if (a.hCreationDate && b.hCreationDate)
          return (
            moment(a.hCreationDate as Date).unix() -
            moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
      },
    },
    {
      title: 'E-mail',
      dataIndex: 'user',
      width: '25%',
      align: 'center',
      render: value => (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {value}
          </div>
        </div>
      ),
      sorter: (a, b) => {
        return a.user.localeCompare(b.user);
      },
    },
    {
      title: 'Profile',
      dataIndex: 'profile',
      width: '10%',
      render: (profile = 'Fan') => (
        <Tag color={tagColorByPermission[profile]}>{profile}</Tag>
      ),
      align: 'center',
      sorter: (a, b): any => {
        if (a.user && b.user) return a.user.localeCompare(b.user);
        else if (a.user) return -1;
        else if (b.user) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record, index: number) => (
        <>
          <Link to={location.pathname} onClick={() => viewGuest(index, record)}>
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const refreshItem = (record: Fan) => {
    if (loaded) {
      guests[lastViewedIndex] = record;
      setGuests([...guests]);
    } else {
      setGuests([record]);
    }
  };

  const onSaveFan = (record: Fan) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelFan = () => {
    setDetails(false);
  };

  const onChangeFan = async (value: string) => {
    setSearchFilter(value);
    getResources();
  };

  const onSearch = (value: string) => {
    setSearchFilter(value);
    getResources();
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader title="Guests" subTitle="List of guests" />
          <Row
            align="bottom"
            justify="space-between"
            gutter={8}
            className="mb-1 sticky-filter-box"
          >
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={8} xs={16}>
                  <Typography.Title level={5}>
                    Search by Guest e-mail
                  </Typography.Title>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={options}
                    onSelect={onChangeFan}
                    onSearch={onSearch}
                    placeholder="Type to search a guest"
                  />
                </Col>
              </Row>
            </Col>
            <Col lg={8} xs={24}>
              <Row gutter={8} justify="end" className="mt-1">
                <Col lg={8} xs={16}>
                  <Button
                    type="primary"
                    onClick={getResources}
                    loading={loading}
                    style={{
                      marginBottom: '20px',
                      marginRight: '25px',
                    }}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <InfiniteScroll
            dataLength={guests.length}
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
              dataSource={guests}
              loading={refreshing}
              pagination={false}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
            />
          </InfiniteScroll>
        </div>
      )}
      {details && (
        <GuestDetail
          fan={currentGuest}
          onSave={onSaveFan}
          onCancel={onCancelFan}
        />
      )}
    </>
  );
};
export default Guests;
