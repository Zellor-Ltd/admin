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
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import {
  fetchWidgets,
  deleteWidget,
  fetchBrands,
} from 'services/DiscoClubService';
import WidgetDetails from './WidgetDetails';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import { AppContext } from 'contexts/AppContext';
import { Brand } from 'interfaces/Brand';

const Widgets: React.FC<RouteComponentProps> = () => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [details, setDetails] = useState<boolean>(false);
  const history = useHistory();
  const [currentList, setCurrentList] = useState<any>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const filter = useRef<any>();
  const listIndex = useRef<number>(0);

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  useEffect(() => {
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBrands = async () => {
    if (brands?.length) return;
    const response: any = await doFetch(() => fetchBrands());
    setBrands(response.results);
  };

  const getCustomData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() => fetchWidgets({ term: query }));
      setLists(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (index: number, list?: any) => {
    getCustomData('');
    setCurrentList(list);
    listIndex.current = index;
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSave = (record: any) => {
    const listItem = lists.find(item => item.id === record.id);
    if (!listItem) {
      refreshTable(record, lists.length);
      return;
    }
    const index = lists.indexOf(listItem);
    refreshTable(record, index);
  };

  const handleDelete = async (id: string, index: number) => {
    await doRequest(() => deleteWidget(id));
    setLists(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const handleSearch = (query: string) => {
    getCustomData(query);
  };

  const refreshTable = (record: any, index: number) => {
    setLists(prev => [
      ...prev.slice(0, index),
      record,
      ...prev.slice(index + 1),
    ]);
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
            <Tooltip title="Link">Link</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '10%',
      align: 'center',
      render: (value: string) => {
        if (value)
          return (
            <>
              <div style={{ transform: 'scale(0.8)', display: 'inline-block' }}>
                <Tooltip title="Click to copy">
                  <CopyValueToClipboard
                    tooltipText="Copy Link"
                    value={'https://beautybuzz.io/' + value.slice(0, -4)}
                  />
                </Tooltip>
              </div>{' '}
              <a
                href={'https://beautybuzz.io/' + value.slice(0, -4)}
                target="blank"
                style={value ? {} : { pointerEvents: 'none' }}
              >
                <Tooltip title={'https://beautybuzz.io/' + value.slice(0, -4)}>
                  Click to open
                </Tooltip>
              </a>
            </>
          );
        else return '-';
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
            <Tooltip title="Links">Links</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'videos',
      width: '5%',
      render: (links: [any]) => (links ? links.length : '0'),
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
            <Tooltip title="Actions">Actions</Tooltip>
          </div>
        </div>
      ),
      key: 'action',
      width: '5%',
      align: 'right',
      render: (_, record: any, index: number) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEdit(index, record)}
          >
            <EditOutlined />
          </Link>
          <Popconfirm
            title="Are you sure？"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id, index)}
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
    <div className="widgets">
      {!details && (
        <>
          <PageHeader
            title="Widgets"
            className="mb-n05"
            extra={
              <Button key="1" type="primary" onClick={() => handleEdit(0)}>
                New Widget
              </Button>
            }
          />
          <Row gutter={8} align="bottom" justify="end" className="mb-05 ">
            <Col lg={12} xs={24} style={{ paddingRight: '0px' }}>
              <Row justify="end">
                <Col lg={12} xs={24}>
                  <Typography.Title level={5}>Search</Typography.Title>
                  <Input
                    allowClear
                    disabled={loading}
                    placeholder="Search by description"
                    style={{ paddingRight: '4px' }}
                    suffix={<SearchOutlined />}
                    value={filter.current}
                    onChange={(e: any) => {
                      filter.current = e.target.value;
                    }}
                  />
                </Col>
                <Col>
                  <Row justify="end">
                    <Col>
                      {!isMobile && (
                        <Typography.Title level={5} style={{ color: 'white' }}>
                          nothing
                        </Typography.Title>
                      )}
                      <Button
                        type="primary"
                        onClick={() => handleSearch(filter.current)}
                        loading={loading}
                        className={isMobile ? 'mt-15' : 'mr-075 ml-1'}
                      >
                        Search
                        <SearchOutlined style={{ color: 'white' }} />
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={columns}
            dataSource={lists}
            loading={loading}
            pagination={false}
            scroll={{ y: 240, x: true }}
            size="small"
          />
        </>
      )}
      {details && (
        <>
          <PageHeader
            title={
              currentList?.name ? `Edit ${currentList.name}` : 'New Widget'
            }
            className="mb-n05"
          />
          <WidgetDetails
            setCurrentList={setCurrentList}
            currentList={currentList}
            setDetails={setDetails}
            onSave={handleSave}
            brands={brands}
          />
        </>
      )}
    </div>
  );
};

export default Widgets;
