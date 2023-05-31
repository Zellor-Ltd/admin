import {
  Button,
  Col,
  Input,
  PageHeader,
  Row,
  Table,
  Tabs,
  Tooltip,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import {
  fetchLinkBrand,
  fetchLinkCreator,
  fetchLinkProduct,
  fetchLinkProductBrand,
  updateLinkBrand,
  updateLinkCreator,
  updateLinkProduct,
  updateLinkProductBrand,
} from 'services/DiscoClubService';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import moment from 'moment';
import LinkOrganizerDetail from './LinkOrganizerDetail';

const LinkOrganizer: React.FC<RouteComponentProps> = () => {
  const [selectedTab, setSelectedTab] = useState<string>('brand');
  const [loading, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const [details, setDetails] = useState<boolean>(false);
  const history = useHistory();
  const [brands, setBrands] = useState<any[]>([]);
  const [currentList, setCurrentList] = useState<any>();
  const [creators, setCreators] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productBrands, setProductBrands] = useState<any[]>([]);
  const filter = useRef<any>();

  useEffect(() => {
    history.listen((_, action) => {
      if (action === 'POP' && details) setDetails(false);
    });
  });

  const getBrandData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() => fetchLinkBrand({ term: query }));
      setBrands(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getProductBrandData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() =>
        fetchLinkProductBrand({ term: query })
      );
      setProductBrands(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getProductData = useMemo(() => {
    const fetchData = async (query: string) => {
      if (query) {
        const response = await doFetch(() => fetchLinkProduct({ term: query }));
        setProducts(response.results);
      } else message.warning('Must specify search filter to get product data!');
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const getCreatorData = useMemo(() => {
    const fetchData = async (query: string) => {
      const response = await doFetch(() => fetchLinkCreator({ term: query }));
      setCreators(response.results);
    };
    return fetchData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleEditRecord = (list?: any) => {
    setCurrentList(list);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSaveRecord = async (
    record: any,
    setLoadingLocal: any,
    tabName: string
  ) => {
    try {
      setLoadingLocal(true);
      const updatedLinks = currentList.links.map((item: any) => {
        if (item.id === record.id) return record;
        else return item;
      });

      switch (tabName) {
        case 'brand':
          await updateLinkBrand({ ...currentList, links: updatedLinks });
          break;
        case 'productBrand':
          await updateLinkProductBrand({ ...currentList, links: updatedLinks });
          break;
        case 'product':
          await updateLinkProduct({ ...currentList, links: updatedLinks });
          break;
        case 'creator':
          await updateLinkCreator({ ...currentList, links: updatedLinks });
          break;
      }

      message.success('Register updated with success.');
    } catch (error: any) {
      message.error('Error: ' + error.error);
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleCancelRecord = () => {
    setDetails(false);
  };

  const handleSearch = (query: string) => {
    switch (selectedTab) {
      case 'brand':
        getBrandData(query);
        break;
      case 'productBrand':
        getProductBrandData(query);
        break;
      case 'product':
        getProductData(query);
        break;
      case 'creator':
        getCreatorData(query);
        break;
    }
  };

  const brandColumns: ColumnsType<any> = [
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
      dataIndex: ['brand', 'masterBrandLink'],
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
            <Tooltip title="Brand">Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productBrand',
      width: '30%',
      render: (productBrand: any) => productBrand?.brandName,
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
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEditRecord(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const productBrandColumns: ColumnsType<any> = [
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
      dataIndex: ['brand', 'brandLink'],
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
            <Tooltip title="Product Brand">Product Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productBrand',
      width: '30%',
      render: (productBrand: any) => productBrand.brandName,
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
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEditRecord(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const productColumns: ColumnsType<any> = [
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
            <Tooltip title="Product">Product</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'product',
      width: '30%',
      render: (product: any) => product.name,
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
            <Tooltip title="Product Brand">Product Brand</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'productBrand',
      width: '30%',
      render: (productBrand: any) => productBrand.brandName,
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
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEditRecord(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  const creatorColumns: ColumnsType<any> = [
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
      dataIndex: ['creator', 'userName'],
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
            <Tooltip title="creator">Creator</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'creator',
      width: '30%',
      render: (creator: any) =>
        creator?.name?.trim() === '' ? creator?.userName : creator?.name,
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
      render: (links: [any]) => links.length,
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
            <Tooltip title="Last Update">Last Update</Tooltip>
          </div>
        </div>
      ),
      dataIndex: 'hLastUpdate',
      width: '10%',
      render: (datetime: Date) =>
        datetime
          ? new Date(datetime).toLocaleDateString('en-GB') +
            ' ' +
            new Date(datetime).toLocaleTimeString('en-GB')
          : '-',
      align: 'center',
      sorter: (a, b): any => {
        if (a.iLastUpdate && b.iLastUpdate)
          return (
            moment(a.iLastUpdate as Date).unix() - moment(b.iLastUpdate).unix()
          );
        else if (a.iLastUpdate) return -1;
        else if (b.iLastUpdate) return 1;
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
      width: '5%',
      align: 'right',
      render: (_, record) => (
        <>
          <Link
            to={{ pathname: window.location.pathname, state: record }}
            onClick={() => handleEditRecord(record)}
          >
            <EditOutlined />
          </Link>
        </>
      ),
    },
  ];

  return (
    <div className="link-organizer">
      {!details && (
        <>
          <PageHeader title="Link Organizer" className="mb-n05" />
          <Row
            gutter={8}
            align="bottom"
            justify="space-between"
            className="mb-05 sticky-filter-box"
          >
            <Col lg={4} md={12} xs={24}>
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
          <Tabs
            className="tab-page"
            onChange={handleTabChange}
            activeKey={selectedTab}
          >
            <Tabs.TabPane tab="Brand" key="brand">
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={brandColumns}
                dataSource={brands}
                loading={loading}
                pagination={false}
                scroll={{ y: 240, x: true }}
                size="small"
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Product Brand" key="productBrand">
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={productBrandColumns}
                dataSource={productBrands}
                loading={loading}
                pagination={false}
                scroll={{ y: 240, x: true }}
                size="small"
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Product" key="product">
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={productColumns}
                dataSource={products}
                loading={loading}
                pagination={false}
                scroll={{ y: 240, x: true }}
                size="small"
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Creator" key="creator">
              <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={creatorColumns}
                dataSource={creators}
                loading={loading}
                pagination={false}
                scroll={{ y: 240, x: true }}
                size="small"
              />
            </Tabs.TabPane>
          </Tabs>
        </>
      )}
      {details && (
        <LinkOrganizerDetail
          record={currentList}
          onSave={handleSaveRecord}
          onCancel={handleCancelRecord}
          tabName={selectedTab}
        />
      )}
    </div>
  );
};

export default LinkOrganizer;
