import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import {
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
import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchGuests } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import GuestDetail from './GuestDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';
import { SelectOption } from 'interfaces/SelectOption';
import MultipleFetchDebounceSelect from 'components/select/MultipleFetchDebounceSelect';

const tagColorByPermission: any = {
  Admin: 'green',
  Temp: 'blue',
  Fan: '',
};

const Guests: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentGuest, setCurrentGuest] = useState<Fan>();
  const { doFetch } = useRequest({ setLoading });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [eof, setEof] = useState<boolean>(false);
  const [guests, setGuests] = useState<Fan[]>([]);
  const [guestBuffer, setGuestBuffer] = useState<Fan[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const loadingGuests = useRef(false);

  const fanOptionMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
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

  useEffect(() => {
    if (refreshing) {
      setEof(false);
      getGuests();
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    if (loadingGuests.current) {
      if (!loaded) setLoaded(true);
      setGuests(guestBuffer);
      loadingGuests.current = false;
    }
  }, [guestBuffer]);

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

  const loadGuests = (shouldResetArray: boolean) => {
    if (shouldResetArray) setGuestBuffer([]);
    loadingGuests.current = true;
    setRefreshing(true);
  };

  const getGuests = async (input?: string, loadNextPage?: boolean) => {
    const pageToUse = loadingGuests.current
      ? page
      : !loadNextPage
      ? 0
      : optionsPage;

    const response: any = await doFetch(() =>
      fetchGuests({
        page: pageToUse,
        query: input ?? searchFilter,
      })
    );

    setGuestBuffer(prev => [...prev.concat(response.results)]);

    if (loadingGuests.current) {
      setPage(pageToUse + 1);
      if (response.results.length < 30) setEof(true);
    } else {
      setOptionsPage(pageToUse + 1);
    }

    return response.results;
  };

  const viewGuest = (index: number, fan: Fan) => {
    setLastViewedIndex(index);
    setCurrentGuest(fan);
    setDetails(true);
    loadingGuests.current = true;
  };

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

  const handleChangeFan = async (value?: string) => {
    if (value) {
      const entity = guestBuffer.find(guest => guest.user === value);
      if (entity) viewGuest(-1, entity as Fan);
    } else {
      setGuests([]);
    }
  };

  const handleKeyDown = (event: any) => {
    if (event.code.toString().startsWith('Key' || 'Space'))
      setSearchFilter(prev => prev?.concat(event.key));
    if (event.key === 'Enter' && searchFilter) {
      loadGuests(true);
      setSearchFilter('');
    }
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader title="Guests" subTitle="List of Guests" />
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
                  <MultipleFetchDebounceSelect
                    style={{ width: '100%' }}
                    fetchOptions={getGuests}
                    onChange={handleChangeFan}
                    onInputKeyDown={event => handleKeyDown(event)}
                    optionMapping={fanOptionMapping}
                    placeholder="Type to search a guest"
                  ></MultipleFetchDebounceSelect>
                </Col>
              </Row>
            </Col>
            <Col lg={8} xs={24}>
              <Row gutter={8} justify="end" className="mt-1">
                <Col lg={8} xs={16}>
                  <Button
                    type="primary"
                    onClick={() => loadGuests(true)}
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
            next={() => loadGuests(false)}
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
          fan={currentGuest as Fan}
          onSave={onSaveFan}
          onCancel={onCancelFan}
        />
      )}
    </>
  );
};
export default Guests;
