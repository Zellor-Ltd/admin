import {
  Col,
  Row,
  Popconfirm,
  Button,
  Card,
  Statistic,
  List,
  Tabs,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import {
  DeleteOutlined,
  GlobalOutlined,
  ShopOutlined,
  SkinOutlined,
  TagOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import CopyIdToClipboard from 'components/CopyIdToClipboard';
import React, { useEffect, useState } from 'react';
import {
  fetchActiveRegFansPerDay,
  fetchProductsPerDay,
  fetchPreRegs,
  deletePreReg,
  fetchFanActivity,
  fetchInstaPagesStats,
} from 'services/DiscoClubService';
import { PreReg } from 'interfaces/PreReg';
import { FanActivity } from 'interfaces/FanActivity';
import { ColumnsType } from 'antd/lib/table';
import '@ant-design/flowchart/dist/index.css';
import { Column, Line, Pie, Sunburst } from '@ant-design/plots';

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
      title: '_id',
      dataIndex: 'id',
      width: '5%',
      render: (id: any) => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    { title: 'Email', dataIndex: 'email', width: '15%' },
    {
      title: 'Creation Date',
      dataIndex: 'hCreationDate',
      width: '65%',
      align: 'center',
      responsive: ['sm'],
      render: (hCreationDate: Date) =>
        moment(hCreationDate).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'action',
      width: '15%',
      align: 'right',
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
      title: '_id',
      dataIndex: 'id',
      width: '5%',
      render: (id: any) => <CopyIdToClipboard id={id} />,
      align: 'center',
    },
    { title: 'User', dataIndex: 'user', width: '30%' },
    { title: 'Total DD', dataIndex: 'totalDiscoDollars', width: '10%' },
    { title: 'Wishlist Items', dataIndex: 'wishListItems', width: '10%' },
    {
      title: 'Logins in the last 10 days',
      dataIndex: 'last10dayslogins',
      width: '15%',
    },
    { title: 'Total Ordered', dataIndex: 'totalOrdered', width: '10%' },
    { title: 'Items Ordered', dataIndex: 'itemsOrdered', width: '10%' },
    {
      title: 'Videos watched this month',
      dataIndex: 'feedsWatchedThisMonth',
      width: '10%',
    },
  ];

  const cardStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    transform: 'scale(1.25)',
    padding: '10px 0 0 0',
  };

  const Revenue = () => {
    const data = [
      {
        type: 'January',
        sales: 38,
      },
      {
        type: 'February',
        sales: 52,
      },
      {
        type: 'March',
        sales: 61,
      },
      {
        type: 'April',
        sales: 145,
      },
      {
        type: 'June',
        sales: 48,
      },
      {
        type: 'July',
        sales: 19,
      },
      {
        type: 'August',
        sales: 41,
      },
      {
        type: 'September',
        sales: 18,
      },
      {
        type: 'October',
        sales: 28,
      },
      {
        type: 'November',
        sales: 8,
      },
      {
        type: 'December',
        sales: 61,
      },
    ];

    const config = {
      data,
      xField: 'type',
      yField: 'sales',
      columnWidthRatio: 0.5,
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
        },
      },
      meta: {
        type: {
          alias: '类别',
        },
        sales: {
          alias: 'Sales',
        },
      },
    };
    return <Column {...config} />;
  };

  const data = [
    {
      title: 'Average Order Value',
      value: '€125.00',
    },
    {
      title: 'Direct Sales',
      value: '356',
    },
    {
      title: 'Creator Sales',
      value: '275',
    },
    {
      title: 'Creator Commission Paid',
      value: '€1250.00',
    },
  ];

  const VideoQuantity = () => {
    const data = [
      {
        type: 'Brand Videos',
        value: 300,
      },
      {
        type: 'Creator Videos',
        value: 125,
      },
      {
        type: 'Reviewer Videos',
        value: 72,
      },
    ];

    const config = {
      width: 300,
      height: 167,
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 30,
      innerRadius: 2,
      interactions: [
        {
          type: 'element-selected',
        },
        {
          type: 'element-active',
        },
      ],
    };
    return <Pie {...config} />;
  };

  const CreatorSunburst = () => {
    const data = {
      label: 'root',
      children: [
        {
          label: 'Content Creators',
          children: [
            {
              label: 'Creators',
              children: null,
              uv: 0,
              sum: 7,
              count: 0,
            },
            {
              label: 'Reviewers',
              children: null,
              uv: 0,
              sum: 13,
              count: 0,
            },
          ],
          uv: 0,
          sum: 1,
          count: 0,
        },
        {
          label: 'Creator Social Post',
          children: [
            {
              label: 'Creators',
              children: null,
              uv: 0,
              sum: 5,
              count: 0,
            },
            {
              label: 'Reviewers',
              children: null,
              uv: 0,
              sum: 31,
              count: 0,
            },
          ],
          uv: 1,
          sum: 20,
          count: 0,
        },
      ],
    };

    const config = {
      data,
      innerRadius: 0.3,
      interactions: [
        {
          type: 'element-active',
        },
      ],
      hierarchyConfig: {
        field: 'sum',
      },
      drilldown: {
        breadCrumb: {
          rootText: '起始',
          position: 'top-left' as any,
        },
      },
    };

    return <Sunburst {...config} />;
  };

  const UserSunburst = () => {
    const data = {
      label: 'root',
      children: [
        {
          label: 'Registered Users',
          children: [
            {
              label: 'Monthly Active',
              children: null,
              uv: 0,
              sum: 7,
              count: 0,
            },
            {
              label: 'Purchased',
              children: null,
              uv: 0,
              sum: 13,
              count: 0,
            },
          ],
          uv: 0,
          sum: 1,
          count: 0,
        },
        {
          label: 'Guests',
          children: [
            {
              label: 'Monthly Active',
              children: null,
              uv: 0,
              sum: 50,
              count: 0,
            },
            {
              label: 'Purchased',
              children: null,
              uv: 0,
              sum: 31,
              count: 0,
            },
          ],
          uv: 1,
          sum: 20,
          count: 0,
        },
      ],
    };

    const config = {
      data,
      innerRadius: 0.3,
      interactions: [
        {
          type: 'element-active',
        },
      ],
      hierarchyConfig: {
        field: 'sum',
      },
      drilldown: {
        breadCrumb: {
          rootText: '起始',
          position: 'top-left' as any,
        },
      },
    };

    return <Sunburst {...config} />;
  };

  const callback = key => {
    console.log(key);
  };

  const InstaPages = () => {
    const [pagesStats, setPagesStats] = useState([]);

    useEffect(() => {
      getInstaPagesStats();
    }, []);

    const getInstaPagesStats = async () => {
      const { results }: any = await doFetch(() => fetchInstaPagesStats());
      setPagesStats(results);
    };

    const config = {
      pagesStats,
      xField: 'day',
      yField: 'value',
      seriesField: 'category',
      yAxis: {
        label: {
          formatter: v => `${v}`,
        },
      },
      color: ['#1979C9', '#D62A0D', '#FAA219'],
    };

    return <Line {...{ ...config, data: pagesStats }} />;
  };

  return (
    <>
      <Row gutter={[32, 32]} align="bottom" className="mb-1">
        <Col lg={6} xs={24}>
          <Card>
            <div className="card-content">
              <Statistic
                value={1}
                valueStyle={cardStyle}
                suffix={<GlobalOutlined style={{ color: '#084BA3' }} />}
                title={'Countries'}
              />
            </div>
          </Card>
        </Col>
        <Col lg={6} xs={24}>
          <Card>
            <div className="card-content">
              <Statistic
                value={2}
                valueStyle={cardStyle}
                suffix={<ShopOutlined style={{ color: '#3f8600' }} />}
                title="Stores"
              />
            </div>
          </Card>
        </Col>
        <Col lg={6} xs={24}>
          <Card>
            <div className="card-content">
              <Statistic
                value={125}
                valueStyle={cardStyle}
                suffix={<SkinOutlined style={{ color: '#cf1322' }} />}
                title="Brands"
              />
            </div>
          </Card>
        </Col>
        <Col lg={6} xs={24}>
          <Card>
            <div className="card-content">
              <Statistic
                value={2500}
                valueStyle={cardStyle}
                suffix={<TagOutlined style={{ color: '#F0CC18' }} />}
                title="SKUs"
              />
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[32, 32]} align="top">
        <Col lg={16} xs={24}>
          <div className="dashboard-items">
            <span>
              Revenue
              <br />
              <hr />
              <br />
              <br />
            </span>
            <Revenue />
          </div>
        </Col>
        <Col lg={8} xs={24}>
          <Col span={24}>
            <Tabs defaultActiveKey="1" onChange={callback}>
              <Tabs.TabPane tab="Creators" key="1">
                <CreatorSunburst />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Users" key="2">
                <UserSunburst />
              </Tabs.TabPane>
            </Tabs>
          </Col>
        </Col>
      </Row>
      <Row gutter={[32, 32]} align="top">
        <Col lg={16} xs={24}>
          <div className="dashboard-items">
            <span>
              InstaLink Pages Statistics
              <br />
              <hr />
              <br />
              <br />
            </span>
            <InstaPages />
          </div>
        </Col>
        <Col lg={8} xs={24}>
          <Col span={24}></Col>
        </Col>
      </Row>
      <Row
        gutter={[32, 32]}
        justify="space-between"
        align="bottom"
        className="mt-1"
      >
        <Col lg={12} xs={24}>
          <div className="dashboard-items">
            <List
              header={<div>Purchases</div>}
              itemLayout="horizontal"
              dataSource={data}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={item.title} />
                  <div>{item.value}</div>
                </List.Item>
              )}
            />
          </div>
        </Col>
        <Col lg={12} xs={24}>
          <div className="dashboard-items">
            <span>
              Video Quantity
              <br />
              <hr />
              <br />
              <br />
            </span>
            <VideoQuantity />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Dashboard;
