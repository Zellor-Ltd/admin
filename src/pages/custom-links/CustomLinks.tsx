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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import {
  fetchCustomLinkLists,
  deleteCustomLinkList,
} from 'services/DiscoClubService';
import CustomDetails from './CustomLinkDetails';
import CopyValueToClipboard from 'components/CopyValueToClipboard';

const CustomLinks: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState(false);
  const { doFetch, doRequest } = useRequest({ setLoading });
  const [details, setDetails] = useState<boolean>(false);
  const history = useHistory();
  const [currentList, setCurrentList] = useState<any>();
  const [custom, setCustom] = useState<any[]>([]);
  const filter = useRef<any>();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  const getCustomData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() =>
        fetchCustomLinkLists({ term: query })
      );
      setCustom(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = (list?: any) => {
    setCurrentList(list);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSave = (record: any) => {
    const listItem = custom.find(item => item.id === record.id);
    if (!listItem) {
      refreshTable(record, custom.length);
      return;
    }
    const index = custom.indexOf(listItem);
    refreshTable(record, index);
  };

  const handleDelete = async (id: string, index: number) => {
    await doRequest(() => deleteCustomLinkList({ id }));
    setCustom(prev => [...prev.slice(0, index), ...prev.slice(index + 1)]);
  };

  const handleSearch = (query: string) => {
    getCustomData(query);
  };

  const refreshTable = (record: any, index: number) => {
    setCustom(prev => [
      ...prev.slice(0, index),
      record,
      ...prev.slice(index + 1),
    ]);
  };

  const customColumns: ColumnsType<any> = [
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
            <Tooltip title="id">id</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'id',
      width: '3%',
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
            <a
              href={'https://beautybuzz.io/' + value.slice(0, -4)}
              target="blank"
              style={value ? {} : { pointerEvents: 'none' }}
            >
              {value ? `https://beautybuzz.io/${value.slice(0, -4)}` : '-'}
            </a>
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
      dataIndex: 'links',
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
            onClick={() => handleEdit(record)}
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
    <div className="link-organizer">
      {!details && (
        <>
          <PageHeader
            title="Custom Links"
            className="mb-n05"
            extra={
              <Button key="1" type="primary" onClick={() => handleEdit()}>
                New Link List
              </Button>
            }
          />
          <Row
            gutter={8}
            align="bottom"
            justify="space-between"
            className="mb-05 sticky-filter-box"
          >
            <Col lg={4} md={12} xs={24} className="mb-1">
              <Typography.Title level={5}>Search</Typography.Title>
              <Input
                allowClear
                disabled={loading}
                placeholder="Search by Description"
                suffix={<SearchOutlined />}
                value={filter.current}
                onChange={(e: any) => {
                  filter.current = e.target.value;
                }}
              />
            </Col>
            <Col lg={4} md={12} xs={24}>
              <Row justify="end" className="mt-1">
                <Col>
                  <Button
                    type="primary"
                    onClick={() => handleSearch(filter.current)}
                    loading={loading}
                  >
                    Search
                    <SearchOutlined style={{ color: 'white' }} />
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Table
            rowClassName={(_, index) => `scrollable-row-${index}`}
            rowKey="id"
            columns={customColumns}
            dataSource={custom}
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
            title={currentList ? `Edit ${currentList.name}` : 'New Link List'}
            className="mb-n05"
          />
          <CustomDetails customList={currentList} onSave={handleSave} />
        </>
      )}
    </div>
  );
};

export default CustomLinks;
