import {
  Button,
  Col,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Spin,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { RouteComponentProps } from 'react-router-dom';
import { fetchTrends, saveTrend } from 'services/DiscoClubService';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import scrollIntoView from 'scroll-into-view';
import { SimpleSwitch } from 'components/SimpleSwitch';

const Trends: React.FC<RouteComponentProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSwitch, setLoadingSwitch] = useState<String>('');
  const { doFetch } = useRequest({ setLoading });
  const [filter, setFilter] = useState<string>('');
  const [updatingTrendIndex, setUpdatingIndex] = useState<
    Record<string, boolean>
  >({});
  const shouldUpdateIndex = useRef(false);
  const { isMobile } = useContext(AppContext);
  const [buffer, setBuffer] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, buffer]);

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  const getResources = async () => {
    await getTrends();
  };

  const getTrends = async () => {
    scrollToCenter(0);
    const { results } = await doFetch(fetchTrends);
    setBuffer(results);
  };

  const handleIndexChange = (newIndex: number, trend: any) => {
    shouldUpdateIndex.current = trend.index !== newIndex;

    const row = buffer.find(item => item.id === trend.id);
    row.index = newIndex;

    const tmp = buffer.map(item => {
      if (item.id === row.id) return row;
      else return item;
    });

    setBuffer([...tmp]);
  };

  const updateIndex = async (trend: any) => {
    if (!shouldUpdateIndex.current) return;

    setUpdatingIndex(prev => {
      const newValue = {
        ...prev,
      };
      newValue[trend.id] = true;

      return newValue;
    });

    try {
      await saveTrend(trend);
      message.success(`Register ${trend.tag} updated with success.`);
    } catch (err) {
      console.error(
        `Error while trying to update Trend[${trend.id}] index.`,
        err
      );
      message.success('Error while trying to update Trend index.');
    }

    setUpdatingIndex(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[trend.id];
      return newValue;
    });

    shouldUpdateIndex.current = false;
  };

  const handleSwitchChange = async (trend: any, toggled: boolean) => {
    try {
      setLoadingSwitch(trend.id);
      trend.enabled = toggled;
      await saveTrend(trend);
      message.success(`Register ${trend.tag} updated with success.`);
    } catch (err) {
      console.error(
        `Error while trying to update Trend[${trend.id}] index.`,
        err
      );
      message.success('Error while trying to update Trend index.');
    } finally {
      setLoadingSwitch('');
    }
  };

  const columns: ColumnsType<any> = [
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
            <Tooltip title="Index">Index</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'index',
      width: '10%',
      render: (_, trend) => {
        if (updatingTrendIndex[trend.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              type="number"
              value={trend.index}
              onPressEnter={() => updateIndex(trend as any)}
              onChange={value => handleIndexChange(value, trend)}
              onBlur={() => updateIndex(trend as any)}
            />
          );
        }
      },
      align: 'center',
      sorter: (a, b): any => {
        if (a.index && b.index) return a.index - b.index;
        else if (a.index) return -1;
        else if (b.index) return 1;
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
            <Tooltip title="Description">Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'tag',
      width: '70%',
      sorter: (a, b): any => {
        if (a.tag && b.tag) return a.tag.localeCompare(b.tag);
        else if (a.tag) return -1;
        else if (b.tag) return 1;
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
            <Tooltip title="Enabled">Enabled</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'enabled',
      width: '10%',
      align: 'center',
      render: (_: any, record: any) => (
        <SimpleSwitch
          toggled={!!record.enabled}
          handleSwitchChange={(toggled: boolean) =>
            handleSwitchChange(record, toggled)
          }
          loading={loadingSwitch === record.id}
          disabled={loadingSwitch === record.id}
        />
      ),
      sorter: (a, b): any => {
        if (a.enabled && b.enabled) return 0;
        else if (a.enabled) return -1;
        else if (b.enabled) return 1;
        else return 0;
      },
    },
  ];

  const search = rows => {
    return rows.filter(
      row => row.tag?.toUpperCase().indexOf(filter?.toUpperCase()) > -1
    );
  };

  return (
    <div style={{ overflow: 'clip', height: '100%' }}>
      <PageHeader
        title="Trends"
        subTitle={isMobile ? '' : 'List of Trends'}
        className={isMobile ? 'mb-05' : ''}
      />
      <Row gutter={8} align="bottom" justify="space-between" className="mb-05 ">
        <Col lg={4} md={12} xs={24}>
          <Typography.Title level={5}>Search</Typography.Title>
          <Input
            allowClear
            disabled={loading}
            placeholder="Search by Description"
            suffix={<SearchOutlined />}
            value={filter}
            onChange={event => {
              setFilter(event.target.value);
            }}
          />
        </Col>
        <Col lg={4} md={12} xs={24}>
          <Row justify="end" className="mt-1">
            <Col>
              <Button type="primary" onClick={getResources} loading={loading}>
                Search
                <SearchOutlined style={{ color: 'white' }} />
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <div className="custom-table">
        <Table
          scroll={{ x: true, y: '30em' }}
          rowClassName={(_, index) => `scrollable-row-${index}`}
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />
      </div>
    </div>
  );
};

export default Trends;
