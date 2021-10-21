import { Col, Row, Popconfirm, Button, Table, Typography } from "antd";
import { useRequest } from "hooks/useRequest";
import EditableTable from "components/EditableTable";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import CopyIdToClipboard from "components/CopyIdToClipboard";
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
  fetchPreRegs,
  deletePreReg,
  fetchFanActivity,
} from "services/DiscoClubService";
import Pie from "./Pie";
import Radar from "./Radar";
import { PreReg } from "interfaces/PreReg";
import { FanActivity } from "interfaces/FanActivity";
import { ColumnsType } from "antd/lib/table";

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [fansPerDay, setFansPerDay] = useState<any[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [productsPerDay, setProductsPerDay] = useState<any[]>([]);
  const [preRegs, setPreRegs] = useState<PreReg[]>([]);
  const [fanActivity, setFanActivity] = useState<FanActivity[]>([]);

  const getFans = async () => {
    const { results } = await doFetch(fetchActiveRegFansPerDay);
    setFansPerDay(results);
  };

  const getProducts = async () => {
    const { results } = await doFetch(fetchProductsPerDay);
    setProductsPerDay(results);
  };

  const getPreRegs = async () => {
    const { results } = await doFetch(fetchPreRegs);
    setPreRegs(results);
  };

  const getFanActivity = async () => {
    const { results } = await doFetch(fetchFanActivity);
    setFanActivity(results);
  };

  useEffect(() => {
    getFans();
    getProducts();
    getPreRegs();
    getFanActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preRegistered: ColumnsType<PreReg> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "5%",
      render: (id: any) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    { title: "Email", dataIndex: "email", width: "15%" },
    {
      title: "Creation Date",
      dataIndex: "hCreationDate",
      width: "65%",
      align: "center",
      responsive: ["sm"],
      render: (hCreationDate: Date) =>
        moment(hCreationDate).format("DD/MM/YYYY"),
    },
    {
      title: "Actions",
      key: "action",
      width: "15%",
      align: "right",
      render: (record: PreReg) => (
        <>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deletePreReg(record)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const fanActs: ColumnsType<PreReg> = [
    {
      title: "_id",
      dataIndex: "id",
      width: "5%",
      render: (id: any) => <CopyIdToClipboard id={id} />,
      align: "center",
    },
    { title: "User", dataIndex: "user", width: "30%" },
    { title: "Total DD", dataIndex: "totalDiscoDollars", width: "10%" },
    { title: "Wishlist Items", dataIndex: "wishListItems", width: "10%" },
    {
      title: "Logins in the last 10 days",
      dataIndex: "last10dayslogins",
      width: "15%",
    },
    { title: "Total Ordered", dataIndex: "totalOrdered", width: "10%" },
    { title: "Items Ordered", dataIndex: "itemsOrdered", width: "10%" },
    {
      title: "Videos watched this month",
      dataIndex: "feedsWatchedThisMonth",
      width: "10%",
    },
  ];

  return (
    <>
      <Row style={{ height: "300px" }}>
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
      <Row style={{ height: "300px", marginTop: "40px" }}>
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
              <Bar dataKey="products" fill="#8884d8" name="Added products" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col style={{ width: "40%" }}>
          <Radar></Radar>
        </Col>
      </Row>
      <div style={{ marginBottom: "16px", marginTop: "40px" }}>
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={3}>Pre Registered Users</Typography.Title>
          </Col>
        </Row>
      </div>
      <div>
        <Table rowKey="id" columns={preRegistered} dataSource={preRegs} />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <Row>
          <Col lg={12} xs={24}>
            <Typography.Title level={3}>Fan Activities</Typography.Title>
          </Col>
        </Row>
      </div>
      <div>
        <EditableTable
          rowKey="id"
          columns={fanActs}
          dataSource={fanActivity}
          onSave={() => console.log("saved")}
        />
      </div>
    </>
  );
};

export default Dashboard;
