import {
  FundOutlined,
  TagOutlined,
  HeartFilled,
  ShoppingCartOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

const AdminSideMenu = testMode => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={['brand-dashboard']}>
      {testMode.testMode && (
        <Menu.Item
          key="testMode"
          disabled
          icon={<WarningOutlined />}
          className="test-mode-banner"
        >
          Test Mode
        </Menu.Item>
      )}
      <Menu.Item key="brand-dashboard" icon={<FundOutlined />}>
        <Link to="/brand-dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="preview-list" icon={<TagOutlined />}>
        <Link to="/preview-list">Products</Link>
      </Menu.Item>
      <Menu.Item key="feed" icon={<HeartFilled />}>
        <Link to="/feed">Videos Feed</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
        <Link to="/orders">Orders</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
