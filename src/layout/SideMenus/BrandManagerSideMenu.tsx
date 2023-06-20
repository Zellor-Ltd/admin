import { FundOutlined, LinkOutlined } from '@ant-design/icons';
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
        key="playlists"
        icon={<LinkOutlined />}
        onClick={() => refreshParent('playlists')}
      >
        <Link to="/playlists">Playlists</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
