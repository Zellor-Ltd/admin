import { Col, Row, Typography } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchActiveRegFansPerDay } from '../../services/DiscoClubService';

interface DashboardProps {}

const RegsPerDay: React.FC<DashboardProps> = () => {
  const [fansPerDay, setFansPerDay] = useState<any[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const handleResize = () => {
    if (window.innerWidth < 769) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  const getFans = async () => {
    const { results } = await doFetch(fetchActiveRegFansPerDay);
    setFansPerDay(results);
  };

  useEffect(() => {
    getFans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
            Registrations per Day
          </Typography.Title>
        </Col>
      </Row>
      <Row
        style={
          isMobile
            ? { marginLeft: '-50px', height: '300px' }
            : { height: '300px' }
        }
      >
        <Col lg={18} xs={24}>
          <ResponsiveContainer>
            <LineChart
              width={500}
              height={300}
              data={fansPerDay}
              margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="registers"
                name="Registrations per day"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </div>
  );
};

export default RegsPerDay;
