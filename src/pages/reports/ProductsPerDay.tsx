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
    getProducts();
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
        <Col lg={18} xs={24}>
          <Typography.Title
            level={4}
            className={isMobile ? 'mb-n1 ant-page-header' : 'ant-page-header'}
          >
            Products per Day
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
    </div>
  );
};

export default ProductsPerDay;
