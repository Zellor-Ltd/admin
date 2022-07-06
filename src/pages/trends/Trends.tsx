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
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchTrends, saveTrend } from 'services/DiscoClubService';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';

const Trends: React.FC<RouteComponentProps> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [trends, setTrends] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [updatingTrendIndex, setUpdatingTrendIndex] = useState<
    Record<string, boolean>
  >({});
  const shouldUpdateTrendIndex = useRef(false);
  const originalTrendsIndex = useRef<Record<string, number | undefined>>({});

  const getResources = async () => {
    await getTrends();
  };

  const getTrends = async () => {
    const { results } = await doFetch(fetchTrends);
    setTrends(results);
  };

  const onColumnChange = (trendIndex: number, trend: any) => {
    for (let i = 0; i < trends.length; i++) {
      if (trends[i].id === trend.id) {
        if (originalTrendsIndex.current[trend.id] === undefined) {
          originalTrendsIndex.current[trend.id] = trend.index;
        }

        shouldUpdateTrendIndex.current =
          originalTrendsIndex.current[trend.id] !== trendIndex;

        trends[i].index = trendIndex;
        setTrends([...trends]);
        break;
      }
    }
  };

  const onColumnBlur = async (trend: any) => {
    if (!shouldUpdateTrendIndex.current) {
      return;
    }
    setUpdatingTrendIndex(prev => {
      const newValue = {
        ...prev,
      };
      newValue[trend.id] = true;

      return newValue;
    });
    try {
      await saveTrend(trend);
      message.success('Register updated with success.');
    } catch (err) {
      console.error(
        `Error while trying to update Trend[${trend.id}] index.`,
        err
      );
      message.success('Error while trying to update Trend index.');
    }
    setUpdatingTrendIndex(prev => {
      const newValue = {
        ...prev,
      };
      delete newValue[trend.id];
      return newValue;
    });
    delete originalTrendsIndex.current[trend.id];
    shouldUpdateTrendIndex.current = false;
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Index',
      dataIndex: 'index',
      width: '5%',
      render: (_, trend) => {
        if (updatingTrendIndex[trend.id]) {
          const antIcon = <LoadingOutlined spin />;
          return <Spin indicator={antIcon} />;
        } else {
          return (
            <InputNumber
              type="number"
              value={trend.index}
              onChange={trendIndex => onColumnChange(trendIndex, trend as any)}
              onBlur={() => onColumnBlur(trend as any)}
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
      title: 'Description',
      dataIndex: 'tag',
      width: '95%',
      sorter: (a, b): any => {
        if (a.tag && b.tag) return a.tag.localeCompare(b.tag);
        else if (a.tag) return -1;
        else if (b.tag) return 1;
        else return 0;
      },
    },
  ];

  const search = rows => {
    return rows.filter(row => row.tag?.toLowerCase().indexOf(filter) > -1);
  };

  return (
    <>
      <div>
        <PageHeader title="Trends" subTitle="List of Trends" />
        <Row
          gutter={8}
          align="bottom"
          justify="space-between"
          className="mb-1 sticky-filter-box"
        >
          <Col lg={8} xs={16}>
            <Typography.Title level={5}>Search by Description</Typography.Title>
            <Input
              className="mb-1"
              value={filter}
              onChange={event => {
                setFilter(event.target.value);
              }}
            />
          </Col>
          <Col>
            <Row justify="end">
              <Button
                type="primary"
                onClick={getResources}
                className="mb-1"
                loading={loading}
              >
                Search
                <SearchOutlined style={{ color: 'white' }} />
              </Button>
            </Row>
          </Col>
        </Row>
        <Table
          rowClassName={(_, index) => `scrollable-row-${index}`}
          rowKey="id"
          columns={columns}
          dataSource={search(trends)}
          loading={loading}
          pagination={false}
        />
      </div>
    </>
  );
};

export default Trends;
