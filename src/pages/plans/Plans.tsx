/* eslint-disable react-hooks/exhaustive-deps */
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { Plan } from 'interfaces/Plan';
import { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import PlanDetail from './PlanDetail';
import scrollIntoView from 'scroll-into-view';
import { useRequest } from 'hooks/useRequest';
import { deletePlan, getPlans } from 'services/AdminService';

const Plans: React.FC<RouteComponentProps> = ({ location }) => {
  const [details, setDetails] = useState<boolean>(false);
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [plans, setPlans] = useState<Plan[]>([]);
  const allPlans = useRef<Plan[]>();
  const [planFilter, setPlanFilter] = useState<string>();
  const [currentPlan, setCurrentPlan] = useState<Plan>();
  const { isMobile, setIsScrollable } = useContext(AppContext);
  const history = useHistory();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    if (!allPlans.current) return;
    const filteredPlans: Plan[] = [];
    allPlans.current.forEach((plan: Plan) => {
      if (plan.name)
        if (plan.name.toLowerCase().includes(planFilter?.toLowerCase() ?? ''))
          filteredPlans.push(plan);
    });
    setPlans(filteredPlans);
  }, [planFilter]);

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const { results }: any = await doFetch(() => getPlans());
    setPlans(results);
    if (results) allPlans.current = results;
  };

  useEffect(() => {
    setIsScrollable(details);

    if (!details) {
      scrollIntoView(
        document.querySelector(
          `.scrollable-row-${lastViewedIndex}`
        ) as HTMLElement
      );
    }
  }, [details]);

  const editPlan = (index: number, plan?: Plan) => {
    setLastViewedIndex(index);
    setCurrentPlan(plan);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const refreshItem = (record: Plan) => {
    plans[lastViewedIndex] = record;
    setPlans([...plans]);
  };

  const savePlan = (record: Plan) => {
    refreshItem(record);
    setDetails(false);
  };

  const cancelPlan = () => {
    setDetails(false);
  };

  const deleteItem = async (id: string, index: number) => {
    setLoading(true);
    try {
      await deletePlan(id);
      setPlans(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const columns: ColumnsType<Plan> = [
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
            <Tooltip title="_id">_id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '6%',
      render: (_, record: Plan) => (
        <CopyValueToClipboard tooltipText="Copy ID" value={record.id} />
      ),
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
            <Tooltip title=" Name"> Name</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'name',
      width: '15%',
      sorter: (a, b) => {
        if (a.name && b.name) return a.name.localeCompare(b.name);
        else if (a.name) return 1;
        else if (b.name) return -1;
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
            <Tooltip title="Users">Users</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'users',
      width: '10%',
      sorter: (a, b): any => {
        if (a.users && b.users) return a.users - b.users;
        else if (a.users) return -1;
        else if (b.users) return 1;
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
            <Tooltip title="Price (Monthly)">Price (Monthly)</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'priceMonthly',
      width: '10%',
      sorter: (a, b): any => {
        if (a.priceMonthly && b.priceMonthly)
          return a.priceMonthly - b.priceMonthly;
        else if (a.priceMonthly) return -1;
        else if (b.priceMonthly) return 1;
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
            <Tooltip title="Price (Yearly)">Price (Yearly)</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'priceYearly',
      width: '10%',
      sorter: (a, b): any => {
        if (a.priceYearly && b.priceYearly)
          return a.priceYearly - b.priceYearly;
        else if (a.priceYearly) return -1;
        else if (b.priceYearly) return 1;
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
            <Tooltip title="Video Uploads">Video Uploads</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'videoUploads',
      width: '10%',
      sorter: (a, b): any => {
        if (a.videoUploads && b.videoUploads)
          return a.videoUploads - b.videoUploads;
        else if (a.videoUploads) return -1;
        else if (b.videoUploads) return 1;
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
            <Tooltip title="Video Plays/Month">Video Plays/Month</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'videoPlaysMonth',
      width: '10%',
      sorter: (a, b): any => {
        if (a.videoPlaysMonth && b.videoPlaysMonth)
          return a.videoPlaysMonth - b.videoPlaysMonth;
        else if (a.videoPlaysMonth) return -1;
        else if (b.videoPlaysMonth) return 1;
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
            <Tooltip title="Show Watermark">Show Watermark</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'showWatermark',
      width: '15%',
      align: 'center',
      render: (value: boolean) => (
        <div style={{ color: value ? 'green' : 'red' }}>
          {value ? <CheckOutlined /> : <CloseOutlined />}
        </div>
      ),
      sorter: (a, b): any => {
        if (a.showWatermark && b.showWatermark) return 0;
        else if (a.showWatermark) return -1;
        else if (b.showWatermark) return 1;
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
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '10%',
      align: 'center',
      render: (_, record: Plan, index: number) => (
        <>
          <Link to={location.pathname} onClick={() => editPlan(index, record)}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id, index)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      {!details && (
        <div
          style={{
            overflow: 'clip',
            height: '100%',
          }}
        >
          <PageHeader
            title="Plans"
            subTitle={isMobile ? '' : 'List of Plans'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editPlan(plans.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="mb-05">
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Name
              </Typography.Title>
              <Input
                allowClear
                disabled={loading}
                onChange={event => setPlanFilter(event.target.value)}
                placeholder="Search by Name"
                suffix={<SearchOutlined />}
              />
            </Col>
            {/* 
            <Col lg={4} xs={24}>
              <Typography.Title level={5} title="Search">
                Email
              </Typography.Title>
              <Input
                allowClear
                disabled={loading}
                onChange={event => setEmailFilter(event.target.value)}
                placeholder="Search by Email"
                suffix={<SearchOutlined />}
              />
            </Col> */}
          </Row>
          <div className="custom-table">
            <Table
              scroll={{ x: true, y: '31em' }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={plans}
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {details && (
        <div style={{ overflow: 'scroll', height: '100%' }}>
          <PlanDetail
            onSave={savePlan}
            onCancel={cancelPlan}
            plan={currentPlan as Plan}
          />
        </div>
      )}
    </>
  );
};

export default Plans;
