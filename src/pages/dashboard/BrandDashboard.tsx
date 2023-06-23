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
import { Area } from '@ant-design/plots';
import Meta from 'antd/lib/card/Meta';
import { ColumnsType } from 'antd/lib/table';
import SimpleSelect from 'components/select/SimpleSelect';
import { statusList } from 'components/select/select.utils';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';
import { Brand } from 'interfaces/Brand';
import { Creator } from 'interfaces/Creator';
import moment from 'moment';
import { ResponsiveBar } from '@nivo/bar';

interface DashboardProps {}

const BrandDashboard: React.FC<DashboardProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const inputRefTitle = useRef<any>(null);
  const [sourceFilter, setSourceFilter] = useState<string>();
  const [brandFilter, setBrandFilter] = useState<Brand>();
  const [titleFilter, setTitleFilter] = useState<string>();
  const [creatorFilter, setCreatorFilter] = useState<Creator | null>();
  const [impressionFilter, setImpressionFilter] = useState<string>();
  const [stats, setStats] = useState<any>();
  const [period, setPeriod] = useState<string>('Today');
  const inputFocused = useRef<boolean>(false);
  const selectionEnd = useRef<number>();

  useEffect(() => {
    getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  useEffect(() => {
    if (inputRefTitle.current && titleFilter) {
      if (selectionEnd.current === titleFilter.length || !inputFocused.current)
        inputRefTitle.current.focus({
          cursor: 'end',
        });
      else {
        const title = document.getElementById('title') as HTMLInputElement;
        inputRefTitle.current.focus();
        title!.setSelectionRange(selectionEnd.current!, selectionEnd.current!);
      }
    }
  }, [titleFilter]);

  const getStats = useMemo(() => {
    const getClientStats = async () => {
      let startDate;
      switch (period) {
        case 'Today':
          startDate = moment().startOf('day').format('YYYYMMDDhhmmss');
          break;
        case 'Last 3 Days':
          startDate = moment()
            .subtract(3, 'days')
            .startOf('day')
            .format('YYYYMMDDhhmmss');
          break;
        case 'Last Week':
          startDate = moment()
            .subtract(7, 'days')
            .startOf('day')
            .format('YYYYMMDDhhmmss');
          break;
        case 'Last 30 Days':
          startDate = moment()
            .subtract(1, 'month')
            .startOf('day')
            .format('YYYYMMDDhhmmss');
          break;
        case 'Last 3 months':
          startDate = moment()
            .subtract(3, 'months')
            .startOf('day')
            .format('YYYYMMDDhhmmss');
          break;
        case 'Last Year':
          startDate = moment()
            .subtract(1, 'year')
            .startOf('day')
            .format('YYYYMMDDhhmmss');
          break;
      }

      const endDate = moment().format('YYYYMMDDhhmmss');
      const { result }: any = await doFetch(() =>
        fetchStats(startDate, endDate)
      );
      setStats(result);
    };
    return getClientStats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const VideoGraph = () => {
    return (
      <div style={{ height: '400px' }}>
        <ResponsiveBar
          data={stats?.stats ?? []}
          keys={['productClicks', 'impressions', 'videoPlays']}
          indexBy="date"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          groupMode="grouped"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: 'purpleRed_green' }}
          borderColor={{
            from: 'color',
            modifiers: [['darker', 1.6]],
          }}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: null,
            legendPosition: 'middle',
            legendOffset: 32,
            format: d =>
              `${d.slice(6, 8) + '/' + d.slice(4, 6) + '/' + d.slice(0, 4)}`,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: null,
            legendPosition: 'middle',
            legendOffset: -40,
          }}
          axisTop={null}
          axisRight={null}
          label=""
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          legendLabel={x => {
            switch (x.id) {
              case 'impressions':
                return 'Impressions';
              case 'productClicks':
                return 'Product Clicks';
              default:
                return 'Video Plays';
            }
          }}
          role="application"
          tooltip={({ id, label, value, color }) => {
            const date = label.slice(-8);
            let property;
            switch (id) {
              case 'impressions':
                property = 'Impressions';
                break;
              case 'productClicks':
                property = 'Product Clicks';
                break;
              default:
                property = 'Video Plays';
                break;
            }
            return (
              <div
                style={{
                  padding: 12,
                  background: 'white',
                }}
              >
                <span>
                  {date.slice(6, 8) +
                    '/' +
                    date.slice(4, 6) +
                    '/' +
                    date.slice(0, 4)}
                </span>
                <br />
                <p style={{ color: color, display: 'inline' }}>■</p>
                {'  '}
                {property}: {value}
              </div>
            );
          }}
        />
      </div>
    );
  };

  const DashCard = ({ icon, title, number }) => (
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
                    {period}
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
            <Tooltip title="Client">Client</Tooltip>
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
          dataSource={stats?.videos}
          pagination={false}
          scroll={{ y: 240, x: true }}
          size="small"
        />
      </>
    );
  };

  const handleTitleFilterChange = (event: any) => {
    setTitleFilter(event.target.value);
    const selectionStart = event.target.selectionStart;
    selectionEnd.current = event.target.selectionEnd;
    if (selectionStart && selectionEnd) inputFocused.current = true;
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
              id="title"
              disabled={true}
              ref={inputRefTitle}
              onChange={event => handleTitleFilterChange(event)}
              suffix={<SearchOutlined />}
              value={titleFilter}
              placeholder="Video search"
              onPressEnter={() =>
                console.log(
                  'fetch here, fix focus behavior + brandmanagerproducts behaviour too'
                )
              }
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
              placeholder="Clients"
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
                    onChange={setPeriod}
                    placeholder="Timeframe"
                    style={{ width: '100%' }}
                    filterOption={filterOption}
                    allowClear
                    showSearch
                    value={period}
                  >
                    <Select.Option key="Today" value="Today" label="Today">
                      Today
                    </Select.Option>
                    <Select.Option
                      key="Last 3 Days"
                      value="Last 3 Days"
                      label="Last 3 Days"
                    >
                      Last 3 Days
                    </Select.Option>
                    <Select.Option
                      key="Last Week"
                      value="Last Week"
                      label="Last Week"
                    >
                      Last Week
                    </Select.Option>
                    <Select.Option
                      key="Last 30 Days"
                      value="Last 30 Days"
                      label="Last 30 Days"
                    >
                      Last 30 Days
                    </Select.Option>
                    <Select.Option
                      key="Last 3 months"
                      value="Last 3 Months"
                      label="Last 3 months"
                    >
                      Last 3 months
                    </Select.Option>
                    <Select.Option
                      key="Last Year"
                      value="Last Year"
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
            number={stats?.totalWidgetImpressions}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<AppstoreOutlined />}
            title="Widget Interactions"
            number={2504}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Video Plays"
            number={stats?.totalVideoViews}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Avg Watch Time / Session"
            number={stats?.avgWatchTime}
          />
        </Col>
        <Col lg={4} xs={24}>
          <DashCard
            icon={<DropboxOutlined />}
            title="Product Clicks"
            number={stats?.totalProductClicks}
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
