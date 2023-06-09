import { FundOutlined, TagOutlined, HddOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';

const AdminSideMenu = () => {
  const history = useHistory();
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
        key="playlist-studio"
        icon={<HddOutlined />}
        onClick={() => refreshParent('playlist-studio')}
      >
        <Link to="/playlist-studio">Playlist Studio</Link>
      </Menu.Item>
      <Menu.Item
        key="brand-products"
        icon={<TagOutlined />}
        onClick={() => refreshParent('brand-products')}
      >
        <Link to="/brand-products">Products</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
