import {
  Button,
  PageHeader,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import { EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { fetchCustomLinkLists, fetchLinkBrand, fetchLinkCreator, fetchLinkProduct, fetchLinkProductBrand, updateLinkBrand } from 'services/DiscoClubService';
import CustomDetails from './CustomDetails';
import CopyValueToClipboard from 'components/CopyValueToClipboard';
import moment from 'moment';
import LinkOrganizerDetail from './LinkOrganizerDetail';

const LinkOrganizer: React.FC<RouteComponentProps> = () => {
  const [selectedTab, setSelectedTab] = useState<string>('brand');
  const [loading, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const [customLinkLists, setCustomLinkLists] = useState<any[]>([]);
  const [details, setDetails] = useState<boolean>(false);
  const history = useHistory();
  const [brands, setBrands] = useState<any[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any>(); 
  const [creators, setCreators] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productBrands, setProductBrands] = useState<any[]>([]);
  
  useEffect(() => {
      history.listen((_, action) => {
          if (action === 'POP' && details) setDetails(false);
      });
  });

  useEffect(() => {
    getBrandData();
    getProductData();
    getCreatorData();
    getCustomData();
  }, []);

      const getBrandData = async () => {
        const response = await doFetch(() =>
            fetchLinkBrand({})
        );
      setBrands(response.results)
      };

      const getProductBrandData = async () => {
          const response = await doFetch(() =>
              fetchLinkProductBrand({})
          );
          setProductBrands(response.results)
      };
      const getProductData = async () => {
          const response = await doFetch(() =>
              fetchLinkProduct({})
          );
      setProducts(response.results)
      };

      const getCreatorData = async () => {
          const response = await doFetch(() =>
              fetchLinkCreator({})
          );
      setCreators(response.results)
      };

      const getCustomData = async () => {
          const response = await doFetch(() =>
              fetchCustomLinkLists({})
          );
      setCustomLinkLists(response.results)
      };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleEditRecord = (record?: any) => {
      setCurrentRecord(record);
    setDetails(true);
    history.push(window.location.pathname);
  };

  const handleSaveRecord = async (record: any, setLoadingLocal: any) => {
      try {
          setLoadingLocal(true)
          await updateLinkBrand(record)
          setDetails(false);
      } finally {
          setLoadingLocal(true)
      }
  };

  const handleCancelRecord = () => {
      setDetails(false);
  };

  const handleSaveCustomList = (record: any) => {
    const listItem = customLinkLists.find(item => item.id === record.id)
    if (!listItem){
      refreshTable(record, customLinkLists.length)
      return
    }
    const index = customLinkLists.indexOf(listItem)
    refreshTable(record, index);
  };

  const refreshTable = (record: any, index: number) => {
      setCustomLinkLists(prev => [...prev.slice(0, index), record, ...prev.slice(index + 1)]);
  }

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
                      <Tooltip title="brand">Brand</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'productBrand',
          width: '30%',
          render: (productBrand: any) => (
              productBrand?.brandName
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
                      <Tooltip title="Links">Links</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'links',
          width: '5%',
          render: (links: [any]) => (
              links.length
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
                      moment(a.iLastUpdate as Date).unix() -
                      moment(b.iLastUpdate).unix()
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
                      onClick={() => handleEditRecord(record)}>
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
                      <Tooltip title="Product Brand">Product Brand</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'productBrand',
          width: '30%',
          render: (productBrand: any) => (
              productBrand.brandName
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
                      <Tooltip title="Links">Links</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'links',
          width: '5%',
          render: (links: [any]) => (
              links.length
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
                      moment(a.iLastUpdate as Date).unix() -
                      moment(b.iLastUpdate).unix()
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
                      onClick={() => handleEditRecord(record)}>
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
                      <Tooltip title="Product">Product</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'product',
          width: '30%',
          render: (product: any) => (
              product.name
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
                      <Tooltip title="Product Brand">Product Brand</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'productBrand',
          width: '30%',
          render: (productBrand: any) => (
              productBrand.brandName
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
                      <Tooltip title="Links">Links</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'links',
          width: '5%',
          render: (links: [any]) => (
              links.length
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
                      moment(a.iLastUpdate as Date).unix() -
                      moment(b.iLastUpdate).unix()
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
                      onClick={() => handleEditRecord(record)}>
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
                      <Tooltip title="creator">Creator</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'creator',
          width: '30%',
          render: (creator: any) => (
              creator?.name?.trim() === "" ? creator?.userName : creator?.name
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
                      <Tooltip title="Links">Links</Tooltip>
                  </div>
              </div>
          ),
          dataIndex: 'links',
          width: '5%',
          render: (links: [any]) => (
              links.length
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
                      moment(a.iLastUpdate as Date).unix() -
                      moment(b.iLastUpdate).unix()
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
                      onClick={() => handleEditRecord(record)}>
                      <EditOutlined />
                  </Link>
              </>
          ),
      },
  ];

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
                    <Tooltip title="Edit">Edit</Tooltip>
                </div>
            </div>
        ),
        key: 'action',
        width: '5%',
        align: 'right',
        render: (_, record, index: number) => (
            <>
                <Link
                    to={{ pathname: window.location.pathname, state: record }}
                    onClick={() => handleEditRecord(record)}>
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
        <PageHeader
          title="Link Organizer"
          className="mb-n05"
          extra={selectedTab === 'custom' && <Button
          key="1"
          type="primary"
          onClick={() => handleEditRecord()}
        >
          New Link List
        </Button>}
        />
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
          <Tabs.TabPane tab="Custom" key="custom">
            <Table
                rowClassName={(_, index) => `scrollable-row-${index}`}
                rowKey="id"
                columns={customColumns}
                dataSource={customLinkLists}
                loading={loading}
                pagination={false}
                scroll={{ y: 240, x: true }}
                size="small"
            />
          </Tabs.TabPane>
        </Tabs>
        </>
      )}
      {selectedTab === 'custom' && details && (
        <>      
          <PageHeader
            title={currentRecord ? `Edit ${currentRecord.name}` : "New Link List"}
            className="mb-n05"
            
          />
          <CustomDetails customList={currentRecord} onSave={handleSaveCustomList} />
        </>
      )}
      {selectedTab !== 'custom' && details && (
          <LinkOrganizerDetail
              record={currentRecord}
              onSave={handleSaveRecord}
              onCancel={handleCancelRecord} />
      )}
    </div>
  );
};

export default LinkOrganizer;
