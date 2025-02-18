import {
  CreditCardOutlined,
  SettingOutlined,
  ShopOutlined,
  SmallDashOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';

const AdminSideMenu = () => {
  const [, pathname] = useLocation().pathname.split('/');
  const history = useHistory();

  const refreshParent = (path: string) => {
    if (pathname === path) history.go(0);
  };

  return (
    <Menu theme="dark" selectedKeys={[pathname]} defaultOpenKeys={['clients']}>
      <Menu.Item
        key="clients"
        icon={<ShopOutlined />}
        onClick={() => refreshParent('clients')}
      >
        <Link to="/clients">Clients</Link>
      </Menu.Item>
      <Menu.Item
        key="plans"
        icon={<CreditCardOutlined />}
        onClick={() => refreshParent('plans')}
      >
        <Link to="/plans">Plans</Link>
      </Menu.Item>
      <Menu.Item
        key="change-temp-password"
        icon={<SmallDashOutlined />}
        onClick={() => refreshParent('change-temp-password')}
      >
        <Link to="/change-temp-password">Change Temp PWD</Link>
      </Menu.Item>
      <Menu.Item
        key="app-settings"
        icon={<SettingOutlined />}
        onClick={() => refreshParent('app-settings')}
      >
        <Link to="/app-settings">Settings</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
