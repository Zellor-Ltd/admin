import { Col, Row, Typography } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchProductsPerDay } from '../../services/DiscoClubService';

interface DashboardProps {}

const ProductsPerDay: React.FC<DashboardProps> = () => {
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [productsPerDay, setProductsPerDay] = useState<any[]>([]);
  const getProducts = async () => {
    const { results } = await doFetch(fetchProductsPerDay);
    setProductsPerDay(results);
  };

  useEffect(() => {
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={3}>Products per Day</Typography.Title>
          </Col>
        </Row>
      </div>
      <Row style={{ height: '300px', marginTop: '40px' }}>
        <Col style={{ width: '60%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={productsPerDay}
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
              <Bar dataKey="products" fill="#8884d8" name="Added products" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </>
  );
};

export default ProductsPerDay;
