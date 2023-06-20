import {
  Col,
  Row,
  Card,
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
  DropboxOutlined,
  PlayCircleOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchStats } from 'services/DiscoClubService';
import '@ant-design/flowchart/dist/index.css';
import { Area, Column } from '@ant-design/plots';
import Meta from 'antd/lib/card/Meta';
import { ColumnsType } from 'antd/lib/table';
import SimpleSelect from 'components/select/SimpleSelect';
import { statusList } from 'components/select/select.utils';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';
import { Brand } from 'interfaces/Brand';
import { Creator } from 'interfaces/Creator';
import moment from 'moment';

interface DashboardProps {}

const BrandDashboard: React.FC<DashboardProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const [startDate, setStartDate] = useState<string>();
  const inputRefTitle = useRef<any>(null);
  //todo reduce all filters to one state
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
  const [clientStats, setClientStats] = useState<any>();
  const [viewStats, setViewStats] = useState<any>();

  //get response, set stats(general, views)
  //const derived from stats containing formatted view stats (uef dep stats)

  useEffect(() => {
    const tmp: any[] = [];
    if (clientStats?.videos)
      clientStats.videos.forEach((video: any) => {
        video.stats.forEach((item: any) => {
          tmp.push([
            ...tmp,
            {
              label: 'Impressions',
              value: item.impressions,
              date: item.date,
            },
            {
              label: 'Product Clicks',
              value: item.productClicks,
              date: item.date,
            },
            {
              label: 'Video Plays',
              value: item.videoPlays,
              date: item.date,
            },
          ]);
        });
      });
    setViewStats(tmp);
  }, [clientStats]);

  useEffect(() => {
    getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate]);

  useEffect(() => {
    if (inputRefTitle.current)
      inputRefTitle.current.focus({
        cursor: 'end',
      });
  }, [titleFilter]);

  //todo reduce
  useEffect(() => {
    console.log('render');
  });

  const getStats = useMemo(() => {
    const getClientStats = async () => {
      const endDate = moment().format('YYYYMMDDhhmmss');
      const { result }: any = await doFetch(() =>
        fetchStats(startDate, endDate)
      );
      setClientStats(result);
    };
    return getClientStats;
  }, [startDate]);

  const VideoGraph = () => {
    const config = {
      data: viewStats,
      isGroup: true,
      xField: 'date',
      yField: 'value',
      seriesField: 'label',
      legend: undefined,
      meta: {
        views: {
          min: 0,
          max: 1000,
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
      tickInterval: 100,
      dodgePadding: 0,
      maxColumnWidth: 20,
    };

    return <Column {...config} />;
  };

  const DashCard = ({ icon, title, time, number }) => (
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
          <div style={{ width: '100%' }}>
            <p>
              <strong
                className="mr-05"
                style={{ fontSize: '2rem', color: 'black' }}
              >
                {number}
              </strong>
            </p>
          </div>
        }
      />
    </Card>
  );

  const TableGraph = () => {
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
      smooth: true,
      meta: {
        number: {
          min: 1000,
          max: 4000,
        },
      },
      date: {
        formatter: (value: string) => {
          return `${value.slice(6, 8) + '/' + value.slice(4, 6)}`;
        },
      },
    };

    return <Area height={50} {...config} />;
  };

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
        return <TableGraph />;
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
                    disabled={loading}
                    onChange={setStartDate}
                    placeholder="Timeframe"
                    style={{ width: '100%' }}
                    filterOption={filterOption}
                    allowClear
                    showSearch
                    value={startDate}
                  >
                    <Select.Option
                      key="Today"
                      value={moment().startOf('day').format('YYYYMMDDhhmmss')}
                      label="Today"
                    >
                      Today
                    </Select.Option>
                    <Select.Option
                      key="Last 3 Days"
                      value={moment()
                        .subtract(3, 'days')
                        .startOf('day')
                        .format('YYYYMMDDhhmmss')}
                      label="Last 3 Days"
                    >
                      Last 3 Days
                    </Select.Option>
                    <Select.Option
                      key="Last Week"
                      value={moment()
                        .subtract(7, 'days')
                        .startOf('day')
                        .format('YYYYMMDDhhmmss')}
                      label="Last Week"
                    >
                      Last Week
                    </Select.Option>
                    <Select.Option
                      key="Last 30 Days"
                      value={moment()
                        .subtract(1, 'month')
                        .startOf('day')
                        .format('YYYYMMDDhhmmss')}
                      label="Last 30 Days"
                    >
                      Last 30 Days
                    </Select.Option>
                    <Select.Option
                      key="Last 3 months"
                      value={moment()
                        .subtract(3, 'months')
                        .startOf('day')
                        .format('YYYYMMDDhhmmss')}
                      label="Last 3 months"
                    >
                      Last 3 months
                    </Select.Option>
                    <Select.Option
                      key="Last Year"
                      value={moment()
                        .subtract(1, 'year')
                        .startOf('day')
                        .format('YYYYMMDDhhmmss')}
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
            title="Widget Impressions"
            time="Last 30 Days"
            number={3756}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<AppstoreOutlined />}
            title="Widget Interactions"
            time="Last 30 Days"
            number={2504}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Video Plays"
            time="Last 30 Days"
            number={2306}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Avg Videos / Session"
            time="Last 30 Days"
            number="2m43s"
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<DropboxOutlined />}
            title="Product Clicks"
            time="Last 30 Days"
            number={3.7}
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
