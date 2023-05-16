import {
  PageHeader,
  Tabs,
} from 'antd';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import LinkOrganizerTabBrand from './LinkOrganizerTabBrand';
import LinkOrganizerTabProductBrand from './LinkOrganizerTabProductBrand';
import LinkOrganizerTabProduct from './LinkOrganizerTabProduct';
import LinkOrganizerTabCreator from './LinkOrganizerTabCreator';

const LinkOrganizer: React.FC<RouteComponentProps> = ({ location }) => {
  const [selectedTab, setSelectedTab] = useState<string>('brand');

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <div className="link-organizer">
      <>
        <PageHeader
          title="Link Organizer"
          className="mb-n05"
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
        </Tabs>
      </>
    </div>
  );
};

export default LinkOrganizer;
