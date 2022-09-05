/* eslint-disable react-hooks/exhaustive-deps */
import {
  EditOutlined,
  OrderedListOutlined,
  SettingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import EditMultipleButton from 'components/EditMultipleButton';
import { useRequest } from 'hooks/useRequest';
import { Fan } from 'interfaces/Fan';
import EditFanModal from 'pages/fans/EditFanModal';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchFans } from 'services/DiscoClubService';
import FanAPITestModal from './FanAPITestModal';
import FanFeedModal from './FanFeedModal';
import scrollIntoView from 'scroll-into-view';
import FanDetail from './FanDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';

const tagColorByPermission: any = {
  Admin: 'green',
  Temp: 'blue',
  Fan: '',
};

const Fans: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [fanAPITest, setFanAPITest] = useState<Fan | null>(null);
  const [fanFeedModal, setFanFeedModal] = useState<Fan | null>(null);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentFan, setCurrentFan] = useState<Fan>();
  const { doFetch } = useRequest({ setLoading });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [fans, setFans] = useState<Fan[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { isMobile } = useContext(AppContext);

  useEffect(() => {
    if (refreshing) {
      setFans([]);
      fetchUsers();
      setEof(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const getResources = () => {
    setRefreshing(true);
    setLoaded(true);
  };

  const fetchUsers = async () => {
    scrollToCenter(0);
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchFans({
        page: pageToUse,
        query: searchFilter,
      })
    );

    setPage(pageToUse + 1);

    const validUsers = response.results.filter(
      (fan: Fan) => !fan.userName?.includes('guest')
    );

    if (validUsers.length < 30) setEof(true);

    setFans(prev => [...prev.concat(validUsers)]);
  };

  const updateDisplayedArray = async () => {
    if (!fans.length) return;
    await fetchUsers();
  };

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    if (!details) {
      scrollToCenter(lastViewedIndex);
    }
  }, [details]);

  const editFan = (index: number, fan?: Fan) => {
    setLastViewedIndex(index);
    setCurrentFan(fan);
    setDetails(true);
  };

  const columns: ColumnsType<Fan> = [
    {
      title: '_id',
      dataIndex: 'id',
      width: '10%',
      render: id => <CopyValueToClipboard value={id} />,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'userName',
      width: '25%',
      align: 'center',
      render: (value, record: Fan, index: number) => (
        <Link to={location.pathname} onClick={() => editFan(index, record)}>
          {value}
        </Link>
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
      sorter: (a, b): any => {
        if (a.user && b.user) return a.user.localeCompare(b.user);
        else if (a.user) return -1;
        else if (b.user) return 1;
        else return 0;
      },
    },
    {
      title: 'Profile',
      dataIndex: 'profile',
      width: '10%',
      render: profile => (
        <Tag color={tagColorByPermission[profile]}>{profile}</Tag>
      ),
      align: 'center',
      sorter: (a, b): any => {
        if (a.profile && b.profile) return a.profile.localeCompare(b.profile);
        else if (a.profile) return -1;
        else if (b.profile) return 1;
        else return 0;
      },
    },
    {
      title: 'Group',
      dataIndex: 'group',
      width: '10%',
      render: (_, record) => (
        <Tag color={tagColorByPermission[record.profile]}>{record.group}</Tag>
      ),
      align: 'center',
      sorter: (a, b): any => {
        if (a.group && b.group) return a.group.localeCompare(b.group);
        else if (a.group) return -1;
        else if (b.group) return 1;
        else return 0;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      width: '10%',
      align: 'right',
      render: (_, record, index: number) => (
        <>
          <Link to={location.pathname} onClick={() => editFan(index, record)}>
            <EditOutlined />
          </Link>
          <Button
            onClick={() => setFanAPITest(record)}
            type="link"
            style={{ padding: 0, margin: '6px 0 6px 6px' }}
          >
            <SettingOutlined />
          </Button>
          <Button
            onClick={() => setFanFeedModal(record)}
            type="link"
            style={{ padding: 0, margin: '6px 0 6px 6px' }}
          >
            <OrderedListOutlined />
          </Button>
        </>
      ),
    },
  ];

  const handleEditFans = () => {
    getResources();
    setSelectedRowKeys([]);
  };

  const refreshItem = (record: Fan) => {
    if (loaded) {
      fans[lastViewedIndex] = record;
      setFans([...fans]);
    } else {
      setFans([record]);
    }
  };

  const onSaveFan = (record: Fan) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelFan = () => {
    setDetails(false);
  };

  const onSearch = (value: string) => {
    setSearchFilter(value);
    getResources();
  };

  return (
    <>
      {!details && (
        <>
          <PageHeader
            title="Fans"
            subTitle={isMobile ? '' : 'List of Fans'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editFan(fans.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row
            align="bottom"
            justify="space-between"
            className={'sticky-filter-box'}
          >
            <Col lg={16} xs={24} className="mb-1">
              <Row gutter={8}>
                <Col lg={6} xs={24}>
                  <Typography.Title level={5}>Fan Filter</Typography.Title>
                  <Input
                    disabled={loading || refreshing}
                    style={{ width: '100%' }}
                    onChange={evt => onSearch(evt.target.value)}
                    placeholder="Search by Fan E-mail"
                  />
                </Col>
              </Row>
            </Col>
            <Col lg={8} xs={24}>
              <Row
                gutter={8}
                justify="end"
                className={isMobile ? 'mt-1' : 'mt-2'}
              >
                <Col>
                  <EditMultipleButton
                    text="Edit Fans"
                    arrayList={fans}
                    ModalComponent={EditFanModal}
                    selectedRowKeys={selectedRowKeys}
                    onOk={handleEditFans}
                  />
                </Col>
                <Col>
                  <Button
                    type="primary"
                    onClick={getResources}
                    loading={loading}
                    className={isMobile ? 'mb-1' : 'mb-1 mr-06'}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <FanAPITestModal
            selectedRecord={fanAPITest}
            setSelectedRecord={setFanAPITest}
          />
          <FanFeedModal
            selectedRecord={fanFeedModal}
            setSelectedRecord={setFanFeedModal}
          />
          <InfiniteScroll
            dataLength={fans.length}
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
              scroll={{ x: true }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={fans}
              loading={refreshing}
              pagination={false}
              rowSelection={{
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }}
            />
          </InfiniteScroll>
        </>
      )}
      {details && (
        <FanDetail fan={currentFan} onSave={onSaveFan} onCancel={onCancelFan} />
      )}
    </>
  );
};
export default Fans;
