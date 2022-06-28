import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  message,
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
import { usePrevious } from 'react-use';

const tagColorByPermission: any = {
  Admin: 'green',
  Temp: 'blue',
  Fan: '',
};

const Guests: React.FC<RouteComponentProps> = ({ location }) => {
  const mounted = useRef(false);
  const [, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const prevPageIsDetails = useRef<boolean>(false);
  const [currentGuest, setCurrentGuest] = useState<Fan>();
  const { doFetch } = useRequest({ setLoading });
  const [eof, setEof] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>();
  const persistentUserInput = usePrevious(userInput);
  const [optionsPage, setOptionsPage] = useState<number>(0);
  const [guestsPage, setGuestsPage] = useState<number>(0);
  const [fetchingGuests, setFetchingGuests] = useState<boolean>(false);
  const updatingTable = useRef(false);
  const scrolling = useRef(false);
  const [guests, setGuests] = useState<Fan[]>([]);
  const [buffer, setBuffer] = useState<Fan[]>([]);

  const fanOptionMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    prevPageIsDetails.current = false;

    if (!details) {
      prevPageIsDetails.current = true;

      if (guests.length) {
        setUserInput(persistentUserInput);
        setLoaded(true);
      }

      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );

      if (!loaded && buffer.length > guests.length) {
        setGuests(buffer);
        setGuestsPage(optionsPage);
      }
    }
  }, [details]);

  useEffect(() => {
    if (!loaded && guests.length) setLoaded(true);
  }, [guests]);

  useEffect(() => {
    if (loaded && scrolling.current) setGuests([...buffer]);
  }, [buffer]);

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

  const onSaveFan = (record: Fan) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelFan = () => {
    setDetails(false);
  };

  const refreshItem = (record: Fan) => {
    if (loaded) {
      guests[lastViewedIndex] = record;
      setGuests([...guests]);
    } else {
      setGuests([record]);
    }
  };

  const viewGuest = (index: number, fan: Fan) => {
    setLastViewedIndex(index);
    setCurrentGuest(fan);
    setDetails(true);
  };

  const searchGuests = () => {
    if (buffer.length) {
      setGuests(buffer);
      setGuestsPage(optionsPage);
    } else loadGuests();
  };

  const loadGuests = () => {
    if (prevPageIsDetails.current) return;
    updatingTable.current = true;
    setEof(false);
    setFetchingGuests(true);

    fetchToBuffer(userInput?.toLowerCase()).then(data => {
      setGuests([...buffer].concat(data));
      setFetchingGuests(false);
    });
  };

  const handleChangeFan = async (value?: string) => {
    if (value) {
      const entity = buffer.find(guest => guest.user === value);
      const index = buffer.indexOf(entity as Fan);
      if (entity) viewGuest(index, entity as Fan);
    }
  };

  const fetchToBuffer = async (input?: string, loadNextPage?: boolean) => {
    if (loadNextPage) scrolling.current = true;
    if (userInput !== input) setUserInput(input);
    const pageToUse = updatingTable.current
      ? guestsPage
      : !!loadNextPage
      ? optionsPage
      : 0;

    const response = await doFetch(() =>
      fetchGuests({
        page: pageToUse,
        query: input,
      })
    );

    if (pageToUse === 0) setBuffer(response.results);
    else setBuffer(prev => [...prev.concat(response.results)]);
    setOptionsPage(pageToUse + 1);
    setGuestsPage(pageToUse + 1);

    if (response.results.length < 30 && updatingTable.current) setEof(true);
    updatingTable.current = false;
    scrolling.current = false;

    return response.results;
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && userInput) {
      //buffer was set as input was typed
      setGuests(buffer);
      setGuestsPage(optionsPage);
      const selectedEntity = guests?.find(item => item.user === userInput);
      if (!selectedEntity)
        message.warning(
          "Can't filter Guests with incomplete Fan Filter! Please select a Fan."
        );
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
                    input={userInput}
                    loaded={loaded}
                    onInput={fetchToBuffer}
                    onChange={handleChangeFan}
                    onClear={() => setUserInput('')}
                    options={buffer}
                    onInputKeyDown={(event: HTMLInputElement) =>
                      handleKeyDown(event)
                    }
                    setEof={setEof}
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
                    onClick={searchGuests}
                    disabled={fetchingGuests}
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
            next={loadGuests}
            hasMore={!eof}
            loader={
              guestsPage !== 0 &&
              fetchingGuests && (
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
              loading={fetchingGuests}
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
