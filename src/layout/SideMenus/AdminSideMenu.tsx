import {
  ApartmentOutlined,
  CloudServerOutlined,
  ControlOutlined,
  DollarOutlined,
  GiftOutlined,
  SettingOutlined,
  IdcardOutlined,
  ShoppingCartOutlined,
  SoundOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
  IssuesCloseOutlined,
  LineChartOutlined,
  LinkOutlined,
  UserAddOutlined,
  FolderAddOutlined,
  BarsOutlined,
  LikeOutlined,
  ToTopOutlined,
  LockOutlined,
  UsergroupAddOutlined,
  ScheduleOutlined,
  WalletOutlined,
  UnorderedListOutlined,
  ShopOutlined,
  MobileOutlined,
  RocketOutlined,
  PartitionOutlined,
  PercentageOutlined,
  BlockOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  PlaySquareOutlined,
  PicLeftOutlined,
  FileSyncOutlined,
  HddOutlined,
  ProfileOutlined,
  BarChartOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Link, useHistory, useLocation } from 'react-router-dom';

const AdminSideMenu = () => {
  const [, pathname] = useLocation().pathname.split('/');
  const [parentMenu] = pathname.split('_');
  const history = useHistory();

  const refreshParent = (path: string) => {
    if (pathname === path) history.go(0);
  };

  return (
    <Menu theme="dark" selectedKeys={[pathname]} defaultOpenKeys={['clients']}>
      {/* 
      <Menu.Item
        key="analytics"
        icon={<BarChartOutlined />}
        onClick={() => refreshParent('analytics')}
      >
        <Link to="/analytics">Analytics</Link>
      </Menu.Item> */}
      <Menu.Item
        key="clients"
        icon={<ShopOutlined />}
        onClick={() => refreshParent('clients')}
      >
        <Link to="/clients">Clients</Link>
      </Menu.Item>
      <Menu.Item
        key="maintenance"
        icon={<ApiOutlined />}
        onClick={() => refreshParent('maintenance')}
      >
        <Link to="/maintenance">Maintenance</Link>
      </Menu.Item>
      {/*       <Menu.Item
        key="product-brands"
        icon={<TagOutlined />}
        onClick={() => refreshParent('product-brands')}
      >
        <Link to="/product-brands">Product Brands</Link>
      </Menu.Item>
      <Menu.Item
        key="widgets"
        icon={<HddOutlined />}
        onClick={() => refreshParent('widgets')}
      >
        <Link to="/widgets">Widgets</Link>
      </Menu.Item>
      <Menu.Item
        key="featured-feeds"
        icon={<PicLeftOutlined />}
        onClick={() => refreshParent('featured-feeds')}
      >
        <Link to="/featured-feeds">Featured Feeds</Link>
      </Menu.Item>
      <SubMenu key="marketing" icon={<RocketOutlined />} title="Marketing">
        <Menu.Item
          key="creator-list"
          icon={<UserOutlined />}
          onClick={() => refreshParent('creator-list')}
        >
          <Link to="/creator-list">Creator List</Link>
        </Menu.Item>
        <Menu.Item
          key="home-screen"
          icon={<IdcardOutlined />}
          onClick={() => refreshParent('home-screen')}
        >
          <Link to="/home-screen">Home Screen</Link>
        </Menu.Item>
        <Menu.Item
          key="promo-displays"
          icon={<GiftOutlined />}
          onClick={() => refreshParent('promo-displays')}
        >
          <Link to="/promo-displays">Shop Display</Link>
        </Menu.Item>
        <Menu.Item
          key="promotions"
          icon={<SoundOutlined />}
          onClick={() => refreshParent('promotions')}
        >
          <Link to="/promotions">Promotions</Link>
        </Menu.Item>
        <Menu.Item
          key="direct-links"
          icon={<LinkOutlined />}
          onClick={() => refreshParent('direct-links')}
        >
          <Link to="/direct-links">Platform Links</Link>
        </Menu.Item>
      </SubMenu>
      <Menu.Item
        key="client-users"
        icon={<UserOutlined />}
        onClick={() => refreshParent('client-users')}
      >
        <Link to="/client-users">Client Users</Link>
      </Menu.Item>
      <SubMenu key="settings-menu" icon={<SettingOutlined />} title="Settings">
        <Menu.Item key="access-control" icon={<ControlOutlined />}>
          <Link to="/access-control">Access Control</Link>
        </Menu.Item>
        <Menu.Item
          key="rebuilds"
          icon={<FileSyncOutlined />}
          onClick={() => refreshParent('rebuilds')}
        >
          <Link to="/rebuilds">Rebuilds</Link>
        </Menu.Item>
        <Menu.Item
          key="endpoints"
          icon={<CloudServerOutlined />}
          onClick={() => refreshParent('endpoints')}
        >
          <Link to="/endpoints">Endpoints</Link>
        </Menu.Item>
        <Menu.Item
          key="roles"
          icon={<ApartmentOutlined />}
          onClick={() => refreshParent('roles')}
        >
          <Link to="/roles">Roles</Link>
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
        <Menu.Item
          key="categories"
          icon={<BarsOutlined />}
          onClick={() => refreshParent('categories')}
        >
          <Link to="/categories">Categories</Link>
        </Menu.Item>
        <Menu.Item key="interests" icon={<LikeOutlined />}>
          <Link to="/interests">Interests</Link>
        </Menu.Item>
        <Menu.Item key="trends" icon={<LineChartOutlined />}>
          <Link to="/trends">Trends</Link>
        </Menu.Item>
        <Menu.Item key="fixed-videos" icon={<PlaySquareOutlined />}>
          <Link to="/fixed-videos">Fixed Videos</Link>
        </Menu.Item>
        <Menu.Item
          key="fan-groups"
          icon={<TeamOutlined />}
          onClick={() => refreshParent('fan-groups')}
        >
          <Link to="/fan-groups">Fan Groups</Link>
        </Menu.Item>
        <Menu.Item
          key="tags"
          icon={<TagOutlined />}
          onClick={() => refreshParent('tags')}
        >
          <Link to="/tags">Tags</Link>
        </Menu.Item>
        <Menu.Item key="push-group-tag" icon={<ToTopOutlined />}>
          <Link to="/push-group-tag">Push Group Tag</Link>
        </Menu.Item>
        <Menu.Item key="master-password" icon={<LockOutlined />}>
          <Link to="/master-password">Master Password</Link>
        </Menu.Item>
      </SubMenu> */}
    </Menu>
  );
};

export default AdminSideMenu;
