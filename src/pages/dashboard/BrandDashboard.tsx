import {
  Col,
  Row,
  Card,
  Statistic,
  List,
  Tabs,
  Tooltip,
  Avatar,
  Typography,
  Table,
  Button,
  Popconfirm,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import {
  ArrowUpOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  PlayCircleOutlined,
  ShopOutlined,
  SkinOutlined,
  TagOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import {
  fetchLinkStats,
  fetchLinkEngagement,
  fetchProductEngagement,
  fetchStats,
} from 'services/DiscoClubService';
import '@ant-design/flowchart/dist/index.css';
import { Area, Column, Line, Pie, Sunburst } from '@ant-design/plots';
import Meta from 'antd/lib/card/Meta';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { Link } from 'react-router-dom';

interface DashboardProps {}

const BrandDashboard: React.FC<DashboardProps> = () => {
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [stats, setStats] = useState<any>();
  const videos = [
    {
      thumbnailUrl:
        'https://cdn.discoclub.com/jfka72daefd700248f3a/8fcc92ee-93b1-4505-a618-b8f6621551e7_STR.jpg',
      videoUrl:
        'https://cdn.discoclub.com/jfka72daefd700248f3a/b2e6286d-70e0-4da6-9ff8-f5c1bab2345c_STR.mp4',
      title:
        'The gorgeous bag contains everything you need to enhance your beauty this Christmas.',
      brandName: 'Luna by Lisa Jordan',
      creator: 'Shanice Mavo',
      impressions: 1000,
      views: 800,
      productClicks: 123,
      totalWatchTime: 0,
    },
    {
      thumbnailUrl:
        'https://cdn3.discoclub.com/jfka72daefd700248f3a/2b02d683-d6e4-4457-b2f9-f4665783db7c_STR.jpg',
      videoUrl:
        'https://cdn3.discoclub.com/jfka72daefd700248f3a/68f6031c-861d-4a54-ba05-87b71284deec_STR.MOV',
      title: 'Show your pride with vivid rainbow makeup 🌈✨',
      brandName: '',
      creator: 'Evelyn',
      impressions: 1000,
      views: 800,
      productClicks: 123,
      totalWatchTime: 0,
    },
  ];

  useEffect(() => {
    getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStats = async () => {
    const { result }: any = await doFetch(() => fetchStats());
    setStats(result);
  };

  const LatestViews = () => {
    /* const [data, setData] = useState([]);
  
    useEffect(() => {
      asyncFetch();
    }, []);
  
    const asyncFetch = () => {
      fetch('https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => {
          console.log('fetch data failed', error);
        });
    }; */

    const data = [
      {
        thumbnailUrl:
          'https://cdn.discoclub.com/jfka72daefd700248f3a/8fcc92ee-93b1-4505-a618-b8f6621551e7_STR.jpg',
        videoUrl:
          'https://cdn.discoclub.com/jfka72daefd700248f3a/b2e6286d-70e0-4da6-9ff8-f5c1bab2345c_STR.mp4',
        title:
          'The gorgeous bag contains everything you need to enhance your beauty this Christmas.',
        brandName: 'Luna by Lisa Jordan',
        creator: 'Shanice Mavo',
        impressions: 1000,
        views: 5,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230531',
      },
      {
        thumbnailUrl:
          'https://cdn3.discoclub.com/jfka72daefd700248f3a/2b02d683-d6e4-4457-b2f9-f4665783db7c_STR.jpg',
        videoUrl:
          'https://cdn3.discoclub.com/jfka72daefd700248f3a/68f6031c-861d-4a54-ba05-87b71284deec_STR.MOV',
        title: 'Show your pride with vivid rainbow makeup 🌈✨',
        brandName: '',
        creator: 'Evelyn',
        impressions: 1000,
        views: 8,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230601',
      },
    ];

    const config = {
      data,
      padding: 'auto' as any,
      xField: 'date',
      yField: 'views',
      xAxis: {
        tickCount: 5,
      },
      smooth: true,
      meta: {
        date: {
          formatter: (value: string) => {
            return `${
              value.slice(6, 8) +
              '/' +
              value.slice(4, 6) +
              '/' +
              value.slice(0, 4)
            }`;
          },
        },
      },
    };

    return <Line {...config} />;
  };

  const DashCard = () => (
    <Card style={{ width: '100%' }}>
      <Meta
        title={
          <>
            <Avatar shape="square" size="large" icon={<TeamOutlined />} />
            Total widget impressions
          </>
        }
        description={
          <>
            <Row align="middle">
              <Col>
                <strong style={{ fontSize: '2rem', color: 'black' }}>
                  3756
                </strong>
              </Col>
              <Col>
                <Statistic
                  value={0.39}
                  precision={2}
                  valueStyle={{ color: 'rgb(91,209,147)', fontSize: '1.2rem' }}
                  suffix={
                    <>
                      %<ArrowUpOutlined />
                    </>
                  }
                />
              </Col>
            </Row>

            <CardGraph />
          </>
        }
      />
    </Card>
  );

  const CardGraph = () => {
    const data = [
      {
        date: '20230605',
        number: 2850,
      },
      {
        date: '20230607',
        number: 3000,
      },
      {
        date: '20230610',
        number: 2000,
      },
      {
        date: '20230616',
        number: 3500,
      },
      {
        date: '20230620',
        number: 2500,
      },
      {
        date: '20230622',
        number: 2900,
      },
      {
        date: '20230624',
        number: 2500,
      },
      {
        date: '20230626',
        number: 2700,
      },
    ];

    const config = {
      data,
      padding: 'auto' as any,
      xField: 'date',
      yField: 'number',
      xAxis: {
        tickCount: 5,
      },
      smooth: true,
      meta: {
        number: {
          min: 1000,
          max: 4000,
        },
        date: {
          formatter: (value: string) => {
            return `${value.slice(6, 8) + '/' + value.slice(4, 6)}`;
          },
        },
      },
    };

    return <Area height={250} {...config} />;
  };

  const columns: ColumnsType<any> = [
    {
      title: '',
      dataIndex: 'videoUrl',
      width: '30%',
      align: 'center',
      render: (value?: string) => {
        if (!value) return undefined;
        else
          return (
            <a href={value} target="blank">
              <PlayCircleOutlined />
            </a>
          );
      },
    },
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
            <Tooltip title="Video">Video</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'title',
      width: '30%',
      align: 'center',
    },
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
            <Tooltip title="Brand">Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'brandName',
      width: '30%',
      align: 'center',
    },
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
            <Tooltip title="Creator">Creator</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creator',
      width: '30%',
      align: 'center',
    },
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
            <Tooltip title="Impressions">Impressions</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'impressions',
      width: '30%',
      align: 'center',
    },
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
            <Tooltip title="Views">Views</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'views',
      width: '30%',
      align: 'center',
    },
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
            <Tooltip title="Product Clicks">Product Clicks</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productClicks',
      width: '30%',
      align: 'center',
    },
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
            <Tooltip title="Total Watch Time">Total Watch Time</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'totalWatchTime',
      width: '30%',
      align: 'center',
    },
    {
      title: '',
      dataIndex: 'name',
      width: '30%',
      align: 'center',
      render: () => {
        return 'graph here';
      },
    },
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
            <Tooltip title="Name">Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '30%',
      align: 'center',
    },
  ];

  const StatTable = () => {
    return (
      <>
        <Table
          rowClassName={(_, index) => `scrollable-row-${index}`}
          rowKey="id"
          columns={columns}
          dataSource={videos}
          pagination={false}
          scroll={{ y: 240, x: true }}
          size="small"
        />
      </>
    );
  };

  return (
    <>
      <Row gutter={[32, 32]} align="bottom" className="mb-1">
        <Col span={24}>
          <LatestViews />
        </Col>
      </Row>
      <Row gutter={[32, 32]} align="top">
        <Col lg={6} xs={24}>
          <DashCard />
        </Col>
        <Col lg={6} xs={24}>
          <DashCard />
        </Col>
        <Col lg={6} xs={24}>
          <DashCard />
        </Col>
        <Col lg={6} xs={24}>
          <DashCard />
        </Col>
      </Row>
      <Row gutter={[32, 32]}>
        <Col span={24}>
          <StatTable />
        </Col>
      </Row>
    </>
  );
};

export default BrandDashboard;
