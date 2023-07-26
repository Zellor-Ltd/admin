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
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchBrands,
  fetchInternalStats,
  fetchStats,
} from 'services/DiscoClubService';
import '@ant-design/flowchart/dist/index.css';
import Meta from 'antd/lib/card/Meta';
import { ColumnsType } from 'antd/lib/table';
import { statusList } from 'components/select/select.utils';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';
import { Creator } from 'interfaces/Creator';
import { ResponsiveBar } from '@nivo/bar';
import { AppContext } from 'contexts/AppContext';
import SimpleSelect from 'components/select/SimpleSelect';

interface DashboardProps {}

const Analytics: React.FC<DashboardProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const titleRef = useRef<any>(null);
  const [sourceFilter, setSourceFilter] = useState<string>();
  const [titleFilter, setTitleFilter] = useState<string>();
  const [creatorFilter, setCreatorFilter] = useState<Creator | null>();
  const [impressionFilter, setImpressionFilter] = useState<string>();
  const [stats, setStats] = useState<any>();
  const [period, setPeriod] = useState<string>('1');
  const titleFocused = useRef<boolean>(false);
  const titleSelectionEnd = useRef<number>();
  const timeframe = useRef<any>();
  const { isMobile } = useContext(AppContext);
  const [client, setClient] = useState<any>();
  const [clients, setClients] = useState<any[]>([]);

  const handleScroll = () => {
    if (timeframe.current) timeframe.current.blur();
  };

  useEffect(() => {
    const getBrands = async () => {
      const response: any = await fetchBrands();
      setClients(response.results);
    };

    getBrands();
  }, []);

  useEffect(() => {
    getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, client]);

  useEffect(() => {
    if (titleRef.current && titleFilter) {
      if (
        titleSelectionEnd.current === titleFilter.length ||
        !titleFocused.current
      )
        titleRef.current.focus({
          cursor: 'end',
        });
      else {
        const title = document.getElementById('title') as HTMLInputElement;
        titleRef.current.focus();
        title!.setSelectionRange(
          titleSelectionEnd.current!,
          titleSelectionEnd.current!
        );
      }
    }
  }, [titleFilter]);

  const getStats = useMemo(() => {
    const getAllStats = async () => {
      const { result }: any = await doFetch(() => fetchStats(period));
      setStats(result);
    };

    const getClientStats = async () => {
      const { result }: any = await doFetch(() =>
        fetchInternalStats(period ?? 1, client?.id)
      );
      setStats(result);
    };

    if (client) return getClientStats;
    else return getAllStats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, client]);

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
            format: d => `${d.slice(6, 8) + '/' + d.slice(4, 6)}`,
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
    <Tooltip title={title} placement="topRight">
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
                  {title}
                  <p
                    style={{
                      color: 'lightgray',
                      fontSize: '1rem',
                      marginBottom: '-1rem',
                    }}
                  >
                    {period} {period !== '1' ? 'days' : 'day'}
                  </p>
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
                <br />
              </p>
            </div>
          }
        />
      </Card>
    </Tooltip>
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
      dataIndex: 'videoPlays',
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
      dataIndex: 'productClicks',
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
      dataIndex: 'totalWatchTimeLabel',
      width: '10%',
      align: 'center',
      sorter: (a, b): any => {
        if (a.totalWatchTimeLabel && b.totalWatchTimeLabel)
          return a.totalWatchTimeLabel - b.totalWatchTimeLabel;
        else if (a.totalWatchTimeLabel) return -1;
        else if (b.totalWatchTimeLabel) return 1;
        else return 0;
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
    titleSelectionEnd.current = event.target.selectionEnd;
    if (selectionStart && titleSelectionEnd) titleFocused.current = true;
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
              ref={titleRef}
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
          <Col lg={6} xs={12}>
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
          <Col lg={7} xs={12}>
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
    <div onScroll={handleScroll} style={{ overflowY: 'auto', height: '100%' }}>
      <Row
        gutter={[8, 8]}
        align="bottom"
        justify={isMobile ? 'start' : 'space-around'}
        className="mb-1 mx-2"
      >
        <Col span={24}>
          <Col lg={4} xs={24}>
            <SimpleSelect
              showSearch
              data={clients}
              onChange={(_, brand) => setClient(brand)}
              style={{ width: '100%' }}
              selectedOption={client?.brandName}
              optionMapping={{
                key: 'id',
                label: 'brandName',
                value: 'id',
              }}
              placeholder="Select a Client"
              disabled={!clients.length}
              allowClear
            ></SimpleSelect>
          </Col>
        </Col>
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
                    ref={timeframe}
                  >
                    <Select.Option key="1" value="1" label="Today">
                      Today
                    </Select.Option>
                    <Select.Option key="3" value="3" label="Last 3 Days">
                      Last 3 Days
                    </Select.Option>
                    <Select.Option key="7" value="7" label="Last Week">
                      Last Week
                    </Select.Option>
                    <Select.Option key="30" value="30" label="Last 30 Days">
                      Last 30 Days
                    </Select.Option>
                    <Select.Option key="90" value="90" label="Last 3 months">
                      Last 3 months
                    </Select.Option>
                    <Select.Option key="365" value="365" label="Last Year">
                      Last Year
                    </Select.Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
          <VideoGraph />
        </Col>
        <Col lg={4} xs={8}>
          <DashCard
            icon={<TeamOutlined />}
            title="Widget Impressions"
            number={stats?.totalWidgetImpressions ?? 0}
          />
        </Col>
        <Col lg={4} xs={8}>
          <DashCard
            icon={<AppstoreOutlined />}
            title="Widget Interactions"
            number={stats?.totalWidgetInteractions ?? 0}
          />
        </Col>
        <Col lg={4} xs={8}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Video Plays"
            number={stats?.totalVideoViews ?? 0}
          />
        </Col>
        <Col xs={{ span: 10, offset: 2 }} lg={{ span: 4, offset: 0 }}>
          <DashCard
            icon={<PlayCircleOutlined />}
            title="Total Watch Time"
            number={stats?.totalWatchTimeLabel ?? 0}
          />
        </Col>
        <Col xs={10} lg={4}>
          <DashCard
            icon={<DropboxOutlined />}
            title="Product Clicks"
            number={stats?.totalProductClicks ?? 0}
          />
        </Col>
        <Col span={23}>
          <TableFilters />
          <StatTable />
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
