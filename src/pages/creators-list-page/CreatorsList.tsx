/* eslint-disable react-hooks/exhaustive-deps */
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Image,
  Input,
  PageHeader,
  Popconfirm,
  Row,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from '../../hooks/useRequest';
import { Masthead } from '../../interfaces/Masthead';
import { useCallback, useContext, useState, useEffect } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  deleteMasthead,
  fetchMastheads,
} from '../../services/DiscoClubService';
import CopyValueToClipboard from '../../components/CopyValueToClipboard';
import scrollIntoView from 'scroll-into-view';
import CreatorsPageDetail from './CreatorsListDetail';

const CreatorsPage: React.FC<RouteComponentProps> = ({ location }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doRequest, doFetch } = useRequest({ setLoading: setLoading });
  const [lastViewedIndex, setLastViewedIndex] = useState<number>(-1);
  const [details, setDetails] = useState<boolean>(false);
  const [currentMasthead, setCurrentMasthead] = useState<Masthead>();
  const [buffer, setBuffer] = useState<Masthead[]>([]);
  const [data, setData] = useState<Masthead[]>([]);
  const [filter, setFilter] = useState<string>('');
  const { isMobile } = useContext(AppContext);

  const getResources = useCallback(async () => {
    const { results } = await doFetch(fetchMastheads);
    setBuffer(results);
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

  useEffect(() => {
    const tmp = search(buffer);
    setData(tmp);
  }, [filter, buffer]);

  useEffect(() => {
    if (!details) scrollToCenter(lastViewedIndex);
  }, [details]);

  const scrollToCenter = (index: number) => {
    scrollIntoView(
      document.querySelector(`.scrollable-row-${index}`) as HTMLElement
    );
  };

  const columns: ColumnsType<Masthead> = [
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
      render: id => <CopyValueToClipboard value={id} />,
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
            <Tooltip title="Description">Description</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'description',
      width: '15%',
      align: 'center',
      render: (value, record, index: number) => (
        <Link to={location.pathname} onClick={() => editItem(index, record)}>
          {value}
        </Link>
      ),
      sorter: (a, b) => {
        if (a.description && b.description)
          return a.description.localeCompare(b.description);
        else if (a.description) return 1;
        else if (b.description) return -1;
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
            <Tooltip title="Image">Image</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'image',
      width: '15%',
      align: 'center',
      render: value => <Image className="active-masthead" src={value?.url} />,
    },
    {
      title: 'Actions',
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record, index: number) => (
        <>
          <Link to={location.pathname} onClick={() => editItem(index, record)}>
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deleteItem(record.id)}
          >
            <Button type="link" style={{ padding: 0, margin: 6 }}>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const search = rows => {
    return rows.filter(
      row => row.description?.toUpperCase().indexOf(filter?.toUpperCase()) > -1
    );
  };

  const editItem = (index: number, masthead?: Masthead) => {
    setLastViewedIndex(index);
    setCurrentMasthead(masthead);
    setDetails(true);
  };

  const deleteItem = async (id: string) => {
    await doRequest(() => deleteMasthead({ id }));
    setBuffer(buffer.filter(item => item.id !== id));
  };

  const refreshItem = (record: Masthead, newItem?: boolean) => {
    const tmp = buffer.map(item => {
      if (item.id === record.id) return record;
      else return item;
    });

    setBuffer(newItem ? [...tmp, record] : [...tmp]);
    scrollToCenter(data.length - 1);
  };

  const onSaveMasthead = (record: Masthead, newItem?: boolean) => {
    if (newItem) setFilter('');
    refreshItem(record, newItem);
    setDetails(false);
  };

  const onCancelMasthead = () => {
    setDetails(false);
  };

  return (
    <div style={{ overflow: 'clip', height: '100%' }}>
      {!details && (
        <div className="Mastheads">
          <PageHeader
            title="Mastheads"
            subTitle={isMobile ? '' : 'List of Mastheads'}
            extra={[
              <Button
                key="1"
                className={isMobile ? 'mt-05' : ''}
                onClick={() => editItem(buffer.length)}
              >
                New Item
              </Button>,
            ]}
          />
          <Row gutter={8} className="sticky-filter-box mb-05">
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
          </Row>
          <div>
            <Table
              className="mt-1"
              scroll={{ x: true, y: 300 }}
              rowClassName={(_, index) => `scrollable-row-${index}`}
              rowKey="id"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
            />
          </div>
        </div>
      )}
      {details && (
        <CreatorsPageDetail
          masthead={currentMasthead}
          onSave={onSaveMasthead}
          onCancel={onCancelMasthead}
        />
      )}
    </div>
  );
};

export default CreatorsPage;
