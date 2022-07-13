import { Button, Col, Input, PageHeader, Row, Table, Typography } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import moment from 'moment';
import { useEffect, useState } from 'react';
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
  const [fanGroups, setFanGroups] = useState<FanGroup[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 991);

  const handleResize = () => {
    if (window.innerWidth < 991) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    getResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = async () => {
    await getFanGroups();
  };

  const getFanGroups = async () => {
    const { results } = await doFetch(fetchFanGroups);
    setFanGroups(results);
  };

  useEffect(() => {
    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details, fanGroups]);

  const editFanGroup = (index: number, fanGroup?: FanGroup) => {
    setLastViewedIndex(index);
    setCurrentFanGroup(fanGroup);
    setDetails(true);
  };

  const columns: ColumnsType<FanGroup> = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      width: '20%',
      sorter: (a, b): any => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return -1;
        else if (b.name) return 1;
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
      row => row.name.toUpperCase().indexOf(filter.toUpperCase()) > -1
    );
  };

  const refreshItem = (record: FanGroup) => {
    fanGroups[lastViewedIndex] = record;
    setFanGroups([...fanGroups]);
  };

  const onSaveFanGroup = (record: FanGroup) => {
    refreshItem(record);
    setDetails(false);
  };

  const onCancelFanGroup = () => {
    setDetails(false);
  };

  return (
    <>
      {!details && (
        <div>
          <PageHeader
            title="Fan Groups"
            subTitle={isMobile ? '' : 'List of Fan Groups'}
            className={isMobile ? 'mb-n1' : ''}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editFanGroup(fanGroups.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className={'sticky-filter-box'}>
            <Col lg={4} xs={24}>
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                placeholder="Search by Name"
                suffix={<SearchOutlined />}
                className="mb-1"
                value={filter}
                onChange={event => {
                  setFilter(event.target.value);
                }}
              />
            </Col>
          </Row>
          <Table
            scroll={{ x: true }}
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={search(fanGroups)}
            loading={loading}
            pagination={false}
          />
        </div>
      )}
      {details && (
        <FanGroupDetail
          fanGroup={currentFanGroup}
          onSave={onSaveFanGroup}
          onCancel={onCancelFanGroup}
        />
      )}
    </>
  );
};

export default FanGroups;
