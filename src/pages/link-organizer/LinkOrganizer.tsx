import {
  Button,
  PageHeader,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import LinkOrganizerTabBrand from './LinkOrganizerTabBrand';
import LinkOrganizerTabProductBrand from './LinkOrganizerTabProductBrand';
import LinkOrganizerTabProduct from './LinkOrganizerTabProduct';
import LinkOrganizerTabCreator from './LinkOrganizerTabCreator';
import { EditOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/lib/table';
import { useRequest } from 'hooks/useRequest';
import { fetchCustomLinkLists, updateCustomLinkList } from 'services/DiscoClubService';
import CustomTabDetails from './CustomTabDetails';

const LinkOrganizer: React.FC<RouteComponentProps> = ({ location }) => {
  const [selectedTab, setSelectedTab] = useState<string>('brand');
  const [loading, setLoading] = useState(false);
  const { doFetch } = useRequest({ setLoading });
  const [customLinkLists, setCustomLinkLists] = useState<any[]>([]);
  const [details, setDetails] = useState<boolean>(false);
  const [currentCustomList, setCurrentCustomList] = useState<any>();
  const history = useHistory();

  useEffect(() => {
      history.listen((_, action) => {
          if (action === 'POP' && details) setDetails(false);
      });
  });

  useEffect(() => {
      fetch()
  }, []);

  const fetch = async () => {
      const response = await doFetch(() =>
          fetchCustomLinkLists({})
      );
      setCustomLinkLists(response.results)
  };

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const handleCustomListEdit = (_: number, record?: any) => {
    setCurrentCustomList(record);
    setDetails(true);
    history.push(window.location.pathname);
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
                    onClick={() => handleCustomListEdit(index, record)}>
                    <EditOutlined />
                </Link>
            </>
        ),
    },
];

const CustomTab = () => {
  return (
    <Table
        rowClassName={(_, index) => `scrollable-row-${index}`}
        rowKey="id"
        columns={customColumns}
        dataSource={customLinkLists}
        loading={loading}
        pagination={false}
        scroll={{ y: 240, x: true }}
        size="small"
    />)
}

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
          onClick={() => handleCustomListEdit(0)}
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
            <LinkOrganizerTabBrand />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Product Brand" key="productBrand">
            <LinkOrganizerTabProductBrand />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Product" key="product">
            <LinkOrganizerTabProduct />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Creator" key="creator">
            <LinkOrganizerTabCreator />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Custom" key="custom">
            <CustomTab />
          </Tabs.TabPane>
        </Tabs>
        </>
      )}
      {details && (
        <>      
          <PageHeader
            title={currentCustomList ? `Edit ${currentCustomList.name}` : "New Link List"}
            className="mb-n05"
            
          />
          <CustomTabDetails customList={currentCustomList} />
        </>
      )}
    </div>
  );
};

export default LinkOrganizer;
