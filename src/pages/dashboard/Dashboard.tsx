import { Col, Row, Card, Statistic, List, Tabs } from 'antd';
import {
  GlobalOutlined,
  ShopOutlined,
  SkinOutlined,
  TagOutlined,
} from '@ant-design/icons';
import React from 'react';
import '@ant-design/flowchart/dist/index.css';
import { Column, Pie, Sunburst } from '@ant-design/plots';

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
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
      radius: 40,
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

  return (
    <>
      <Row gutter={[32, 32]} align="bottom" className="mb-1">
        <Col span={4}>
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
        <Col span={4}>
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
        <Col span={4}>
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
        <Col span={4}>
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
        <Col span={16}>
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
        <Col span={8}>
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
      <Row
        gutter={[32, 32]}
        justify="space-between"
        align="bottom"
        className="mt-1"
      >
        <Col span={12}>
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
        <Col span={12}>
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
