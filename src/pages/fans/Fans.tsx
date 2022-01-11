import {
  EditOutlined,
  OrderedListOutlined,
  SettingOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Col, PageHeader, Row, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import EditMultipleButton from 'components/EditMultipleButton';
import { SearchFilter } from 'components/SearchFilter';
import useFilter from 'hooks/useFilter';
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

  const {
    setArrayList: setFans,
    filteredArrayList: filteredFans,
    addFilterFunction,
  } = useFilter<Fan>([]);

  const getFans = async () => {
    const { results } = await doFetch(() => fetchFans());
    setFans(results);
  };

  const getResources = async () => {
    await Promise.all([getFans()]);
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

  const searchFilterFunction = (filterText: string) => {
    addFilterFunction('fanName', fans =>
      fans.filter(fan => {
        fan.name = fan.name || '';
        const searchText = filterText.toUpperCase();
        return (
          fan.name.toUpperCase().includes(searchText) ||
          fan.user.toUpperCase().includes(searchText)
        );
      })
    );
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

  return (
    <>
      {!details && (
        <div className="fans">
          <PageHeader
            title="Fans"
            subTitle="List of Fans"
            extra={[
              <Button key="1" onClick={() => editFan(1)}>
                New Item
              </Button>,
            ]}
          />
          <Row align="bottom" justify="space-between">
            <Col lg={16} xs={24}>
              <Row gutter={8}>
                <Col lg={8} xs={16}>
                  <SearchFilter
                    filterFunction={searchFilterFunction}
                    label="Search by Email"
                  />
                </Col>
              </Row>
            </Col>
            <EditMultipleButton
              text="Edit Fans"
              arrayList={filteredFans}
              ModalComponent={EditFanModal}
              selectedRowKeys={selectedRowKeys}
              onOk={handleEditFans}
            />
            <Button
              type="primary"
              onClick={() => getResources()}
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
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={filteredFans}
            loading={loading}
            rowSelection={{
              selectedRowKeys,
              onChange: setSelectedRowKeys,
            }}
          />
        </div>
      )}
      {details && <FanDetail fan={currentFan} setDetails={setDetails} />}
    </>
  );
};
export default Fans;
