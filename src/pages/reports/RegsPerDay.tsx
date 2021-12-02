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

  const getFans = async () => {
    const { results } = await doFetch(fetchActiveRegFansPerDay);
    setFansPerDay(results);
  };

  useEffect(() => {
    getFans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={3}>Registrations per Day</Typography.Title>
          </Col>
        </Row>
      </div>
      <Row style={{ height: '300px' }}>
        <Col style={{ width: '75%' }}>
          <ResponsiveContainer>
            <LineChart
              width={500}
              height={300}
              data={fansPerDay}
              margin={{
                top: 5,
                right: 30,
                left: 20,
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
    </>
  );
};

export default RegsPerDay;
