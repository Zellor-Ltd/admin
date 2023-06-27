/* eslint-disable react-hooks/exhaustive-deps */
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
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { useRequest } from 'hooks/useRequest';
import { Fan } from 'interfaces/Fan';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
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
  const prevPageisScrollable = useRef<boolean>(false);
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
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  const fanOptionMapping: SelectOption = {
    key: 'id',
    label: 'user',
    value: 'user',
  };

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    prevPageisScrollable.current = false;

    if (!details) {
      prevPageisScrollable.current = true;

      if (guests.length) {
        setUserInput(persistentUserInput);
        setLoaded(true);
      }

      scrollToCenter(lastViewedIndex);

      if (!loaded && buffer.length > guests.length) {
        setGuests(buffer);
        setGuestsPage(optionsPage);
      }
    }

    setIsScrollable(details);
  }, [details]);

  useEffect(() => {
    if (!loaded && guests.length) setLoaded(true);
  }, [guests]);

  useEffect(() => {
    if (loaded && scrolling.current) setGuests([...buffer]);
  }, [buffer]);

  const columns: ColumnsType<Fan> = [
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
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      render: id => <CopyValueToClipboard tooltipText="Copy ID" value={id} />,
      align: 'center',
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Creation">Creation</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="E-mail">E-mail</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Profile">Profile</Tooltip>
          </div>
        </div>
      ),
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
      title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
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
    history.push(window.location.pathname);
  };

  const searchGuests = () => {
    if (buffer.length) {
      setGuests(buffer);
      setGuestsPage(optionsPage);
    } else loadGuests();
  };

  const loadGuests = () => {
    if (prevPageisScrollable.current) return;
    updatingTable.current = true;
    setEof(false);
    setFetchingGuests(true);

    fetchToBuffer(userInput?.toUpperCase()).then(data => {
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
    else scrollToCenter(0);
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
          "Warning: Can't filter Guests with incomplete Fan Filter! Please select a Fan."
        );
    }
  };

  return (
    <>
      {!details && (
        <div style={{ overflow: 'clip', height: '100%' }}>
          <PageHeader
            title="Guests"
            subTitle={isMobile ? '' : 'List of Guests'}
            className={isMobile ? 'my-05 mb-1' : 'mb-1'}
          />
          <Row
            align="bottom"
            justify="space-between"
            className="mb-05 sticky-filter-box"
          >
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>
                    Search by Guest e-mail
                  </Typography.Title>
                  <MultipleFetchDebounceSelect
                    style={{ width: '100%' }}
                    input={userInput}
                    loaded={loaded}
                    disabled={fetchingGuests}
                    onInput={fetchToBuffer}
                    onChange={handleChangeFan}
                    onClear={() => setUserInput('')}
                    options={buffer}
                    onInputKeyDown={(event: HTMLInputElement) =>
                      handleKeyDown(event)
                    }
                    setEof={setEof}
                    optionMapping={fanOptionMapping}
                    placeholder="Type to search a Guest"
                  ></MultipleFetchDebounceSelect>
                </Col>
              </Row>
            </Col>
            <Col lg={8} xs={24}>
              <Row justify="end" className={isMobile ? 'mt-2' : ''}>
                <Col>
                  <Button type="primary" onClick={searchGuests}>
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <div className="custom-table">
            <InfiniteScroll
              height="29rem"
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
                loaded && (
                  <div className="scroll-message">
                    <b>End of results.</b>
                  </div>
                )
              }
            >
              <Table
                scroll={{ x: true }}
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
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <GuestDetail
            fan={currentGuest as Fan}
            onSave={onSaveFan}
            onCancel={onCancelFan}
          />
        </div>
      )}
    </>
  );
};
export default Guests;
