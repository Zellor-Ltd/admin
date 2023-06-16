import {
  Col,
  Row,
  Card,
  Statistic,
  Tooltip,
  Avatar,
  Typography,
  Table,
  Input,
  Select,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import {
  AppstoreOutlined,
  ArrowUpOutlined,
  DropboxOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { fetchStats } from 'services/DiscoClubService';
import '@ant-design/flowchart/dist/index.css';
import { Column } from '@ant-design/plots';
import Meta from 'antd/lib/card/Meta';
import { ColumnsType } from 'antd/lib/table';
import SimpleSelect from 'components/select/SimpleSelect';
import { statusList } from 'components/select/select.utils';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';
import { Brand } from 'interfaces/Brand';
import { Creator } from 'interfaces/Creator';

interface DashboardProps {}

const BrandDashboard: React.FC<DashboardProps> = () => {
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [, setStats] = useState<any>();
  const [periodStart, setPeriodStart] = useState<string>();
  const inputRefTitle = useRef<any>(null);
  const [sourceFilter, setSourceFilter] = useState<string>();
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [titleFilter, setTitleFilter] = useState<string>();
  const [creatorFilter, setCreatorFilter] = useState<Creator | null>();
  const [impressionFilter, setImpressionFilter] = useState<string>();
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

  useEffect(() => {
    if (inputRefTitle.current)
      inputRefTitle.current.focus({
        cursor: 'end',
      });
  }, [titleFilter]);

  const getStats = async () => {
    const { result }: any = await doFetch(() => fetchStats(periodStart));
    setStats(result);
  };

  const VideoGraph = () => {
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
        label: 'Page Loads',
        value: 20,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230521',
      },
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
        label: 'Page Loads',
        value: 255,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230522',
      },
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
        label: 'Page Loads',
        value: 290,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230523',
      },
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
        label: 'Page Loads',
        value: 290,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230524',
      },
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
        label: 'Page Loads',
        value: 280,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230525',
      },
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
        label: 'Page Loads',
        value: 310,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230526',
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
        label: 'Page Loads',
        value: 295,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230527',
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
        label: 'Page Loads',
        value: 325,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230528',
      },
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
        label: 'Product Clicks',
        value: 210,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230521',
      },
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
        label: 'Product Clicks',
        value: 285,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230522',
      },
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
        label: 'Product Clicks',
        value: 240,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230523',
      },
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
        label: 'Product Clicks',
        value: 280,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230524',
      },
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
        label: 'Product Clicks',
        value: 250,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230525',
      },
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
        label: 'Product Clicks',
        value: 290,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230526',
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
        label: 'Product Clicks',
        value: 265,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230527',
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
        label: 'Product Clicks',
        value: 305,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230528',
      },
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
        label: 'Video Plays',
        value: 210,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230521',
      },
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
        label: 'Video Plays',
        value: 285,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230522',
      },
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
        label: 'Video Plays',
        value: 240,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230523',
      },
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
        label: 'Video Plays',
        value: 280,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230524',
      },
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
        label: 'Video Plays',
        value: 250,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230525',
      },
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
        label: 'Video Plays',
        value: 290,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230526',
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
        label: 'Video Plays',
        value: 265,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230527',
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
        label: 'Video Plays',
        value: 305,
        productClicks: 123,
        totalWatchTime: 0,
        date: '20230528',
      },
    ];

    const config = {
      data,
      isGroup: true,
      xField: 'date',
      yField: 'value',
      seriesField: 'label',
      legend: undefined,
      meta: {
        views: {
          min: 0,
          max: 400,
        },
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
      label: {
        content: '',
      } as any,
      dodgePadding: 0,
      maxColumnWidth: 20,
    };
    return <Column {...config} />;
  };

  const DashCard = ({
    icon,
    title,
    time,
    number,
    percentage,
    direction,
    precision,
  }) => (
    <Card style={{ width: '100%', height: 150 }}>
      <Meta
        title={
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'bottom',
            }}
            className="mb-1"
          >
            <div style={{ width: '50px' }}>
              <Avatar
                className="mr-1"
                shape="square"
                size="large"
                icon={icon}
              />
            </div>
            <div
              style={{
                width: '100%',
              }}
            >
              <div>
                <Tooltip title={title}>
                  {title}
                  <p
                    style={{
                      color: 'lightgray',
                      fontSize: '1rem',
                      marginBottom: '-1rem',
                    }}
                  >
                    {time}
                  </p>
                </Tooltip>
              </div>
            </div>
          </div>
        }
        description={
          <>
            <Row align="bottom">
              <Col>
                <strong
                  className="mr-05"
                  style={{ fontSize: '2rem', color: 'black' }}
                >
                  {number}
                </strong>
              </Col>
              <Col>
                <Statistic
                  style={{ position: 'relative', bottom: 5 }}
                  value={percentage}
                  precision={precision}
                  valueStyle={
                    direction === 'up'
                      ? { color: 'rgb(91,209,147)', fontSize: '1.2rem' }
                      : { color: '#cf1322', fontSize: '1.2rem' }
                  }
                  suffix={
                    <>
                      %{'  '}
                      <ArrowUpOutlined style={{ transform: 'scale(0.8)' }} />
                    </>
                  }
                />
              </Col>
            </Row>
          </>
        }
      />
    </Card>
  );

  const columns: ColumnsType<any> = [
    {
      title: '',
      dataIndex: 'videoUrl',
      width: '5%',
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
      width: '20%',
      align: 'center',
      sorter: (a, b) => {
        if (a.title && b.title) return a.title.localeCompare(b.title);
        else if (a.title) return 1;
        else if (b.title) return -1;
        else return 0;
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
            <Tooltip title="Brand">Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'brandName',
      width: '15%',
      align: 'center',
      sorter: (a, b) => {
        if (a.brandName && b.brandName)
          return a.brandName.localeCompare(b.brandName);
        else if (a.brandName) return 1;
        else if (b.brandName) return -1;
        else return 0;
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
            <Tooltip title="Creator">Creator</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creator',
      width: '15%',
      align: 'center',
      sorter: (a, b) => {
        if (a.creator && b.creator) return a.creator.localeCompare(b.creator);
        else if (a.creator) return 1;
        else if (b.creator) return -1;
        else return 0;
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
            <Tooltip title="Impressions">Impressions</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'impressions',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.impressions && b.impressions)
          return a.impressions - b.impressions;
        else if (a.impressions) return -1;
        else if (b.impressions) return 1;
        else return 0;
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
            <Tooltip title="Views">Views</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'views',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.views && b.views) return a.views - b.views;
        else if (a.views) return -1;
        else if (b.views) return 1;
        else return 0;
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
            <Tooltip title="Product Clicks">Product Clicks</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'Product Clicks',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.productClicks && b.productClicks)
          return a.productClicks - b.productClicks;
        else if (a.productClicks) return -1;
        else if (b.productClicks) return 1;
        else return 0;
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
            <Tooltip title="Total Watch Time">Total Watch Time</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'totalWatchTime',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.totalWatchTime && b.totalWatchTime)
          return a.totalWatchTime - b.totalWatchTime;
        else if (a.totalWatchTime) return -1;
        else if (b.totalWatchTime) return 1;
        else return 0;
      },
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

  const TableFilters = () => {
    return (
      <>
        <Row
          gutter={[8, 8]}
          align="bottom"
          justify="space-around"
          className="mt-2 mb-1"
        >
          <Col lg={6} xs={24}>
            <Input
              allowClear
              disabled={true}
              ref={inputRefTitle}
              onChange={event => setTitleFilter(event.target.value)}
              suffix={<SearchOutlined />}
              value={titleFilter}
              placeholder="Video search"
              onPressEnter={() => console.log('fetch here')}
            />
          </Col>
          <Col lg={4} xs={12}>
            <SimpleSelect
              showSearch
              data={[]}
              onChange={(_, brand) => setBrandFilter(brand)}
              style={{ width: '100%' }}
              selectedOption={brandFilter?.id}
              optionMapping={{
                key: 'id',
                label: 'brandName',
                value: 'id',
              }}
              placeholder="Brands"
              disabled={true}
              allowClear
            />
          </Col>
          <Col lg={4} xs={12}>
            <Select
              placeholder="Sources"
              disabled={true}
              onChange={setSourceFilter}
              style={{ width: '100%' }}
              filterOption={filterOption}
              allowClear
              showSearch
              value={sourceFilter}
            >
              {statusList.map((curr: any) => (
                <Select.Option
                  key={curr.value}
                  value={curr.value.toUpperCase()}
                  label={curr.value}
                >
                  {curr.value}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col lg={5} xs={12}>
            <CreatorsMultipleFetchDebounceSelect
              onChangeCreator={(_, creator) => setCreatorFilter(creator)}
              input={creatorFilter?.firstName}
              onClear={() => setCreatorFilter(null)}
              disabled={true}
              placeholder="Creators"
            />
          </Col>
          <Col lg={4} xs={12}>
            <Select
              disabled={true}
              onChange={setImpressionFilter}
              placeholder="Impressions"
              style={{ width: '100%' }}
              filterOption={filterOption}
              allowClear
              showSearch
              value={impressionFilter}
            >
              <Select.Option key="none" value="None" label="None">
                None
              </Select.Option>
            </Select>
          </Col>
        </Row>
      </>
    );
  };

  const filterOption = (input: string, option: any) => {
    return option?.label?.toUpperCase().includes(input?.toUpperCase());
  };

  return (
    <>
      <Row
        gutter={[8, 8]}
        align="bottom"
        justify="space-around"
        className="mb-1 mx-2"
      >
        <Col span={23} className="my-2">
          <Row justify="space-between" align="bottom">
            <Col>
              <Typography.Title level={3}>ENGAGEMENT</Typography.Title>
            </Col>
            <Col lg={6}>
              <Row justify="end">
                <Col>
                  <Select
                    disabled={true}
                    onChange={setPeriodStart}
                    placeholder="Timeframe"
                    style={{ width: '100%' }}
                    filterOption={filterOption}
                    allowClear
                    showSearch
                    value={periodStart}
                  >
                    <Select.Option key="Today" value={0} label="Today">
                      Today
                    </Select.Option>
                    <Select.Option
                      key="Last 3 Days"
                      value={3}
                      label="Last 3 Days"
                    >
                      Last 3 Days
                    </Select.Option>
                    <Select.Option key="Last Week" value={7} label="Last Week">
                      Last Week
                    </Select.Option>
                    <Select.Option
                      key="Last 30 Days"
                      value={30}
                      label="Last 30 Days"
                    >
                      Last 30 Days
                    </Select.Option>
                    <Select.Option
                      key="Last 3 months"
                      value={90}
                      label="Last 3 months"
                    >
                      Last 3 months
                    </Select.Option>
                    <Select.Option
                      key="Last Year"
                      value={365}
                      label="Last Year"
                    >
                      Last Year
                    </Select.Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>

          <VideoGraph />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<TeamOutlined />}
            title="Total Widget Impressions"
            time="Last 30 Days"
            number={3756}
            percentage={0.39}
            direction="up"
            precision={undefined}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<AppstoreOutlined />}
            title="Widget Interactions"
            time="Last 30 Days"
            number={2504}
            percentage={2.84}
            direction="up"
            precision={undefined}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Total Video Plays"
            time="Last 30 Days"
            number={2306}
            percentage={2.84}
            direction="up"
            precision={undefined}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Avg Videos / Session"
            time="Last 30 Days"
            number="2m43s"
            percentage={1.56}
            direction="up"
            precision={2}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<DropboxOutlined />}
            title="Total Product Clicks"
            time="Last 30 Days"
            number={3.7}
            percentage={2.56}
            direction="up"
            precision={1}
          />
        </Col>
        <Col span={23}>
          <TableFilters />
          <StatTable />
        </Col>
      </Row>
    </>
  );
};

export default BrandDashboard;
