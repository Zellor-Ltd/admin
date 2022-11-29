import { Col, Row, Tooltip, Typography } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import EditableTable from '../../components/EditableTable';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { fetchFanActivity } from '../../services/DiscoClubService';
import { PreReg } from '../../interfaces/PreReg';
import { FanActivity } from '../../interfaces/FanActivity';
import { ColumnsType } from 'antd/lib/table';

interface DashboardProps {}

const FanActivities: React.FC<DashboardProps> = () => {
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [fanActivity, setFanActivity] = useState<FanActivity[]>([]);
  const { isMobile } = useContext(AppContext);

  const getFanActivity = async () => {
    const { results } = await doFetch(fetchFanActivity);
    setFanActivity(results);
  };

  useEffect(() => {
    getFanActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fanActs: ColumnsType<PreReg> = [
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
      width: '5%',
      render: (id: any) => <CopyValueToClipboard value={id} />,
      align: 'center',
    },
    {       title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="User">User</Tooltip>
          </div>
        </div>
      ), dataIndex: 'user', width: '30%',
     },
    {       title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Total DD">Total DD</Tooltip>
          </div>
        </div>
      ), dataIndex: 'totalDiscoDollars', width: '10%',
     },
    {       title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Wishlist Items">Wishlist Items</Tooltip>
          </div>
        </div>
      ), dataIndex: 'wishListItems', width: '10%' },
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
            <Tooltip title="Logins in the last 10 days">Logins in the last 10 days</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'last10dayslogins',
      width: '15%'
    },
    {       title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Total Ordered">Total Ordered</Tooltip>
          </div>
        </div>
      ), dataIndex: 'totalOrdered', width: '10%' },
    {       title: (
        <div style={{ display: 'grid', placeItems: 'stretch' }}>
          <div
            style={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Tooltip title="Items Ordered">Items Ordered</Tooltip>
          </div>
        </div>
      ), dataIndex: 'itemsOrdered', width: '10%' },
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
            <Tooltip title="Videos watched this month">Videos watched this month</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'feedsWatchedThisMonth',
      width: '10%'
    },
  ];

  return (
    <>
      <div
        style={
          isMobile
            ? {
                padding: '20px',
              }
            : {}
        }
      >
        <Row className="mb-05">
          <Col lg={12} xs={24}>
            <Typography.Title
              level={4}
              className={isMobile ? 'mb-n1 ant-page-header' : 'ant-page-header'}
            >
              Fan Activities
            </Typography.Title>
          </Col>
        </Row>
        <EditableTable
          scroll={{ x: true }}
          rowKey="id"
          columns={fanActs}
          dataSource={fanActivity}
          onSave={() => console.log('saved')}
        />
      </div>
    </>
  );
};

export default FanActivities;
