import {
  FundOutlined,
  TagOutlined,
  HeartFilled,
  LinkOutlined,
  HddOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const AdminSideMenu = () => {
  const [, pathname] = useLocation().pathname.split('/');
  const refreshParent = (path: string) => {
    if (pathname === path) history.go(0);
  };

  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={['brand-dashboard']}>
      <Menu.Item key="brand-dashboard" icon={<FundOutlined />}>
        <Link to="/brand-dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item
        key="products"
        icon={<TagOutlined />}
        onClick={() => refreshParent('products')}
      >
        <Link to="/products">Products</Link>
      </Menu.Item>
      <Menu.Item
        key="feed"
        icon={<HeartFilled />}
        onClick={() => refreshParent('feed')}
      >
        <Link to="/feed">Videos Feed</Link>
      </Menu.Item>
      <Menu.Item
        key="link-organizer"
        icon={<LinkOutlined />}
        onClick={() => refreshParent('link-organizer')}
      >
        <Link to="/link-organizer">Link Organizer</Link>
      </Menu.Item>
      <Menu.Item
        key="custom-links"
        icon={<HddOutlined />}
        onClick={() => refreshParent('custom-links')}
      >
        <Link to="/custom-links">Custom Links</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
