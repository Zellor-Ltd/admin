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
  DatePicker,
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
import { fetchBrands, fetchInternalStats } from 'services/DiscoClubService';
import '@ant-design/flowchart/dist/index.css';
import Meta from 'antd/lib/card/Meta';
import { ColumnsType } from 'antd/lib/table';
import { statusList } from 'components/select/select.utils';
import CreatorsMultipleFetchDebounceSelect from 'pages/creators/components/CreatorsMultipleFetchDebounceSelect';
import { Creator } from 'interfaces/Creator';
import { ResponsiveBar } from '@nivo/bar';
import { AppContext } from 'contexts/AppContext';
import SimpleSelect from 'components/select/SimpleSelect';
import moment from 'moment';

interface DashboardProps {}

const Analytics: React.FC<DashboardProps> = () => {
  const [, setLoading] = useState<boolean>(true);
  const { doFetch } = useRequest({ setLoading });
  const titleRef = useRef<any>(null);
  const [sourceFilter, setSourceFilter] = useState<string>();
  const [titleFilter, setTitleFilter] = useState<string>();
  const [creatorFilter, setCreatorFilter] = useState<Creator | null>();
  const [impressionFilter, setImpressionFilter] = useState<string>();
  const [stats, setStats] = useState<any>();
  const titleFocused = useRef<boolean>(false);
  const titleSelectionEnd = useRef<number>();
  const { isMobile } = useContext(AppContext);
  const [client, setClient] = useState<any>();
  const [clients, setClients] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<string>(
    moment().subtract(1, 'days').format('YYYYMMDD')
  );
  const [endDate, setEndDate] = useState<string>(moment().format('YYYYMMDD'));
  const period = useRef<number>(1);
  const mounted = useRef<boolean>(false);

  useEffect(() => {
    const getBrands = async () => {
      const response: any = await fetchBrands();
      setClients(response.results);
    };

    getBrands();
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, client]);

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
    const getClientStats = async () => {
      const { result }: any = await doFetch(() =>
        fetchInternalStats({
          brandId: client?.id,
          startDate: startDate,
          endDate: endDate,
        })
      );
      setStats(result);
    };

    return getClientStats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, startDate, endDate, client]);

  const Engagement = () => {
    return (
      <div style={{ height: '400px' }}>
        <ResponsiveBar
          data={stats?.stats ?? []}
          keys={['impressions', 'interactions', 'videoPlays', 'productClicks']}
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
              `${d.toString().slice(6, 8) + '/' + d.toString().slice(4, 6)}`,
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
              case 'interactions':
                return 'Interactions';
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
              case 'interactions':
                property = 'Interactions';
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
      <Card style={{ width: '100%', height: 200 }}>
        <Meta
          title={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'bottom',
              }}
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
                  whiteSpace: 'break-spaces',
                }}
              >
                <div>
                  <p>{title}</p>
                </div>
              </div>
            </div>
          }
          description={
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'bottom',
                flexDirection: 'column',
                position: 'absolute',
                bottom: '0px',
              }}
            >
              <p
                style={{
                  color: 'lightgray',
                  fontSize: '1rem',
                  marginLeft: '50px',
                  position: 'relative',
                  top: '2px',
                }}
              >
                {period.current} {period.current !== 1 ? 'days' : 'day'}
              </p>
              <p style={{ display: 'flex', justifyContent: 'center' }}>
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
      render: (value?: number) => value ?? 0,
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
            <Tooltip title="Interactions">Interactions</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'widgetInteractions',
      width: '10%',
      align: 'center',
      render: (value?: number) => value ?? 0,
      sorter: (a, b): any => {
        if (a.widgetInteractions && b.widgetInteractions)
          return a.widgetInteractions - b.widgetInteractions;
        else if (a.widgetInteractions) return -1;
        else if (b.widgetInteractions) return 1;
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
      render: (value?: number) => value ?? 0,
      sorter: (a, b): any => {
        if (a.videoPlays && b.videoPlays) return a.videoPlays - b.videoPlays;
        else if (a.videoPlays) return -1;
        else if (b.videoPlays) return 1;
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
      render: (value?: number) => value ?? 0,
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
      render: (value?: number) => value ?? 0,
      sorter: (a, b): any => {
        if (a.totalWatchTime && b.totalWatchTime)
          return a.totalWatchTime - b.totalWatchTime;
        else if (a.totalWatchTime) return -1;
        else if (b.totalWatchTime) return 1;
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
          scroll={{ x: true }}
          size="small"
          footer={() => (
            <Row justify="center" className="mt-1">
              <Col>
                <Typography.Title level={5}>End of results.</Typography.Title>
              </Col>
            </Row>
          )}
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

  const onChangeDateRange = dates => {
    if (dates) {
      setStartDate(moment(dates[0]).format('YYYYMMDD'));
      setEndDate(moment(dates[1]).format('YYYYMMDD'));
      period.current = moment(dates[1]).diff(moment(dates[0]), 'days');
    } else {
      setStartDate('0');
      setEndDate('1');
      period.current = 1;
    }
  };

  return (
    <div
      style={{
        overflowY: 'auto',
        overflowX: 'clip',
        height: '100%',
        paddingLeft: '1rem',
      }}
    >
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
              selectedOption={client?.name}
              optionMapping={{
                key: 'id',
                label: 'name',
                value: 'id',
              }}
              placeholder="Select a Client"
              disabled={!clients.length}
              allowClear
            ></SimpleSelect>
          </Col>
        </Col>
        <Col span={24} className="mt-2 ml-2">
          <Row justify="space-between" align="bottom">
            <Col>
              <Typography.Title level={3}>ENGAGEMENT</Typography.Title>
            </Col>
            <Col lg={6}>
              <Row justify="end">
                <Col>
                  <DatePicker.RangePicker
                    onChange={onChangeDateRange}
                    className="mb-1"
                    ranges={{
                      Today: [moment(), moment()],
                      'Last 3 Days': [moment().subtract(2, 'days'), moment()],
                      'Last Week': [moment().subtract(6, 'days'), moment()],
                      'Last 30 Days': [
                        moment().subtract(1, 'months'),
                        moment(),
                      ],
                      'Last 3 Months': [
                        moment().subtract(3, 'months'),
                        moment(),
                      ],
                      'Last Year': [moment().subtract(1, 'year'), moment()],
                    }}
                    format="DD/MM/YYYY"
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Engagement />
        </Col>
        <Col span={24}>
          <Row
            gutter={[8, 8]}
            align="bottom"
            justify={isMobile ? 'start' : 'space-around'}
          >
            <Col lg={4} xs={8}>
              <DashCard
                icon={<TeamOutlined />}
                title="Carousel Impressions"
                number={stats?.totalWidgetImpressions ?? 0}
              />
            </Col>
            <Col lg={4} xs={8}>
              <DashCard
                icon={<AppstoreOutlined />}
                title="Carousel Engagement"
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
          </Row>
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
