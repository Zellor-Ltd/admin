import {
  EditOutlined,
  OrderedListOutlined,
  SettingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
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
import EditMultipleButton from 'components/EditMultipleButton';
import { useRequest } from 'hooks/useRequest';
import { Fan } from 'interfaces/Fan';
import EditFanModal from 'pages/fans/EditFanModal';
import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { fetchFans } from 'services/DiscoClubService';
import FanAPITestModal from './FanAPITestModal';
import FanFeedModal from './FanFeedModal';
import scrollIntoView from 'scroll-into-view';
import FanDetail from './FanDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';
import { SelectOption } from 'interfaces/SelectOption';

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
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentFan, setCurrentFan] = useState<Fan>();
  const { doFetch } = useRequest({ setLoading });
  const [loaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);
  const [fans, setFans] = useState<Fan[]>([]);
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
    const pageToUse = refreshing ? 0 : page;
    const response = await doFetch(() =>
      fetchFans({
        page: pageToUse,
        query: searchFilter,
      })
    );

    setPage(pageToUse + 1);

    const optionFactory = (option: any) => {
      return {
        label: option[fanOptionsMapping.label],
        value: option[fanOptionsMapping.value],
        key: option[fanOptionsMapping.value],
      };
    };

    const validUsers = response.results.filter(
      (fan: Fan) => !fan.userName?.includes('guest')
    );

    if (validUsers.length < 30) setEof(true);

    setOptions(validUsers.map(optionFactory));

    setFans(prev => [...prev.concat(validUsers)]);
  };

  const fetchData = async () => {
    if (!fans.length) return;
    await fetchUsers();
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
      render: id => <CopyIdToClipboard id={id} />,
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
    },
    { title: 'E-mail', dataIndex: 'user', width: '25%', align: 'center' },
    {
      title: 'Profile',
      dataIndex: 'profile',
      width: '10%',
      render: (profile = 'Fan') => (
        <Tag color={tagColorByPermission[profile]}>{profile}</Tag>
      ),
      align: 'center',
    },
    {
      title: 'Group',
      dataIndex: 'group',
      width: '10%',
      render: (_, record) => (
        <Tag color={tagColorByPermission[record.profile]}>{record.group}</Tag>
      ),
      align: 'center',
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

  const handleEditFans = async () => {
    await getResources();
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

  const onChangeFan = async (value: string, _selectedFan?: any) => {
    setSearchFilter(_selectedFan.name);
    getResources();
  };

  const onSearch = (value: string) => {
    setSearchFilter(value);
    getResources();
  };

  return (
    <>
      {!details && (
        <div className="fans">
          <PageHeader
            title="Fans"
            subTitle="List of Fans"
            extra={[
              <Button key="1" onClick={() => editFan(fans.length)}>
                New Item
              </Button>,
            ]}
          />
          <Row
            align="bottom"
            justify="space-between"
            className={'sticky-filter-box'}
          >
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={8} xs={16}>
                  <Typography.Title level={5}>Search Fan</Typography.Title>
                  <AutoComplete
                    style={{ width: '100%' }}
                    options={options}
                    onSelect={onChangeFan}
                    onSearch={onSearch}
                    placeholder="Type to search a fan"
                  />
                </Col>
              </Row>
            </Col>
            <EditMultipleButton
              text="Edit Fans"
              arrayList={fans}
              ModalComponent={EditFanModal}
              selectedRowKeys={selectedRowKeys}
              onOk={handleEditFans}
            />
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
              dataSource={fans}
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
        <FanDetail fan={currentFan} onSave={onSaveFan} onCancel={onCancelFan} />
      )}
    </>
  );
};
export default Fans;
