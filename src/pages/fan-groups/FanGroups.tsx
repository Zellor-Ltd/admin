/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Col,
  Input,
  PageHeader,
  Row,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import moment from 'moment';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { RouteComponentProps } from 'react-router-dom';
import { fetchFanGroups } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import FanGroupDetail from './FanGroupDetail';
import { SearchOutlined } from '@ant-design/icons';

const FanGroups: React.FC<RouteComponentProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentFanGroup, setCurrentFanGroup] = useState<FanGroup>();
  const [buffer, setBuffer] = useState<FanGroup[]>([]);
  const [data, setData] = useState<FanGroup[]>([]);
  const [filter, setFilter] = useState<string>('');
  const { isMobile, setIsDetails } = useContext(AppContext);

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
  }, [filter, buffer]);

  const getResources = async () => {
    await getFanGroups();
  };

  const getFanGroups = async () => {
    const { results } = await doFetch(fetchFanGroups);
    setBuffer(results);
  };

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  useEffect(() => {
    setIsDetails(details);
  }, [details]);

  useEffect(() => {
    if (!details) scrollToCenter(lastViewedIndex);
  }, [details, data]);

  const editFanGroup = (index: number, fanGroup?: FanGroup) => {
    setLastViewedIndex(index);
    setCurrentFanGroup(fanGroup);
    setDetails(true);
  };

  const columns: ColumnsType<FanGroup> = [
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
            <Tooltip title="Group Name">Group Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '20%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
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
            moment(a.hCreationDate).unix() - moment(b.hCreationDate).unix()
          );
        else if (a.hCreationDate) return -1;
        else if (b.hCreationDate) return 1;
        else return 0;
      },
    },
  ];

  const search = rows => {
    return rows.filter(
      row => row.name?.toUpperCase().indexOf(filter?.toUpperCase()) > -1
    );
  };

  const refreshItem = (record: FanGroup, newItem?: boolean) => {
    const tmp = buffer.map(item => {
      if (item.id === record.id) return record;
      else return item;
    });
    setBuffer(newItem ? [...tmp, record] : [...tmp]);
  };

  const onSaveFanGroup = (record: FanGroup, newItem?: boolean) => {
    if (newItem) setFilter('');
    refreshItem(record, newItem);
    setDetails(false);
  };

  const onCancelFanGroup = () => {
    setDetails(false);
  };

  return (
    <div
      style={
        details ? { height: '100%' } : { overflow: 'clip', height: '100%' }
      }
    >
      {!details && (
        <>
          <PageHeader
            title="Fan Groups"
            subTitle={isMobile ? '' : 'List of Fan Groups'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editFanGroup(buffer.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="sticky-filter-box mb-05">
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                allowClear
                disabled={loading}
                placeholder="Search by Name"
                suffix={<SearchOutlined />}
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <div className="empty custom-table">
            <Table
              className="mt-15"
              scroll={{ x: true, y: 300 }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
            />
          </div>
        </>
      )}
      {details && (
        <FanGroupDetail
          fanGroup={currentFanGroup}
          onSave={onSaveFanGroup}
          onCancel={onCancelFanGroup}
        />
      )}
    </div>
  );
};

export default FanGroups;
