import { Col, Row } from "antd";
import { useRequest } from "hooks/useRequest";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchActiveRegFansPerDay,
  fetchProductsPerDay,
} from "services/DiscoClubService";
import Pie from "./Pie";
import Radar from "./Radar";

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [fansPerDay, setFansPerDay] = useState<any[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [productsPerDay, setProductsPerDay] = useState<any[]>([]);

  const getFans = async () => {
    const { results } = await doFetch(fetchActiveRegFansPerDay);
    setFansPerDay(results);
  };

  const getProducts = async () => {
    const { results } = await doFetch(fetchProductsPerDay);
    setProductsPerDay(results);
  };

  useEffect(() => {
    getFans();
    getProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Row style={{ height: "50%" }}>
        <Col style={{ width: "75%" }}>
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
        <Col style={{ width: "25%" }}>
          <Pie></Pie>
        </Col>
      </Row>
      <Row style={{ height: "50%" }}>
        <Col style={{ width: "60%" }}>
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
              <Bar dataKey="products" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col style={{ width: "40%" }}>
          <Radar></Radar>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
