import {
  FundOutlined,
  TagOutlined,
  HeartFilled,
  LinkOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

const AdminSideMenu = () => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={['brand-dashboard']}>
      <Menu.Item key="brand-dashboard" icon={<FundOutlined />}>
        <Link to="/brand-dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="products" icon={<TagOutlined />}>
        <Link to="/products">Products</Link>
      </Menu.Item>
      <Menu.Item key="feed" icon={<HeartFilled />}>
        <Link to="/feed">Videos Feed</Link>
      </Menu.Item>
      <Menu.Item key="link-organizer" icon={<LinkOutlined />}>
        <Link to="/link-organizer">Link Organizer</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
