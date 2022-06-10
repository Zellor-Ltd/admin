import {
  ApartmentOutlined,
  CloudServerOutlined,
  ControlOutlined,
  DollarOutlined,
  FireOutlined,
  GiftOutlined,
  HeartFilled,
  SettingOutlined,
  IdcardOutlined,
  ShoppingCartOutlined,
  SoundOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
  IssuesCloseOutlined,
  DashboardOutlined,
  DropboxOutlined,
  CrownOutlined,
  LineChartOutlined,
  UserAddOutlined,
  FolderAddOutlined,
  ToolOutlined,
  BarsOutlined,
  LikeOutlined,
  FileDoneOutlined,
  ToTopOutlined,
  LockOutlined,
  PicCenterOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Link, useLocation } from 'react-router-dom';

const AdminSideMenu = () => {
  const [, pathname] = useLocation().pathname.split('/');
  const [parentMenu] = pathname.split('_');

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={[pathname]}
      defaultOpenKeys={[parentMenu]}
    >
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <SubMenu key="reports" icon={<LineChartOutlined />} title="Reports">
        <Menu.Item key="regs-per-day" icon={<UserAddOutlined />}>
          <Link to="/regs-per-day">Users per Day</Link>
        </Menu.Item>
        <Menu.Item key="products-per-day" icon={<FolderAddOutlined />}>
          <Link to="/products-per-day">Products per Day</Link>
        </Menu.Item>
        <Menu.Item key="pre-registered" icon={<UserOutlined />}>
          <Link to="/pre-registered">Pre-Registered</Link>
        </Menu.Item>
        <Menu.Item key="fan-activities" icon={<IdcardOutlined />}>
          <Link to="/fan-activities">Fan Activities</Link>
        </Menu.Item>
      </SubMenu>
      <Menu.Item key="brands" icon={<CrownOutlined />}>
        <Link to="/brands">Master Brands</Link>
      </Menu.Item>
      <Menu.Item key="product-brands" icon={<CrownOutlined />}>
        <Link to="/product-brands">Product Brands</Link>
      </Menu.Item>
      <Menu.Item key="products" icon={<DropboxOutlined />}>
        <Link to="/products">Live Products</Link>
      </Menu.Item>
      <Menu.Item key="preview-products" icon={<IssuesCloseOutlined />}>
        <Link to="/preview-products">Preview Products</Link>
      </Menu.Item>
      <Menu.Item key="feed" icon={<HeartFilled />}>
        <Link to="/feed">Video Feeds</Link>
      </Menu.Item>
      <Menu.Item key="fan-videos" icon={<UsergroupAddOutlined />}>
        <Link to="/fan-videos">Fan Videos</Link>
      </Menu.Item>
      <Menu.Item key="feed-templates" icon={<PicCenterOutlined />}>
        <Link to="/feed-templates">Feed Templates</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
        <Link to="/orders">Orders</Link>
      </Menu.Item>
      <Menu.Item key="wallets" icon={<DollarOutlined />}>
        <Link to="/wallets">Wallets</Link>
      </Menu.Item>
      <Menu.Item key="transactions" icon={<DollarOutlined />}>
        <Link to="/transactions">Transactions</Link>
      </Menu.Item>
      <SubMenu key="marketing" icon={<FireOutlined />} title="Marketing">
        <Menu.Item key="marketing_creators-list" icon={<UserOutlined />}>
          <Link to="/marketing_creators-list">Creator List</Link>
        </Menu.Item>
        <Menu.Item key="marketing_home-screen" icon={<IdcardOutlined />}>
          <Link to="/marketing_home-screen">Home Screen</Link>
        </Menu.Item>
        <Menu.Item key="marketing_promo-displays" icon={<GiftOutlined />}>
          <Link to="/marketing_promo-displays">Shop Display</Link>
        </Menu.Item>
        <Menu.Item key="marketing_promotions" icon={<SoundOutlined />}>
          <Link to="/marketing_promotions">Promotions</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="users" icon={<TeamOutlined />} title="Users">
        <Menu.Item key="users_fans" icon={<UserOutlined />}>
          <Link to="/users_fans">Fans</Link>
        </Menu.Item>
        <Menu.Item key="users_guests" icon={<UserOutlined />}>
          <Link to="/users_guests">Guests</Link>
        </Menu.Item>
        <Menu.Item key="creators" icon={<UserOutlined />}>
          <Link to="/users_creators">Creators</Link>
        </Menu.Item>
        {/* <Menu.Item key="brand-managers" icon={<UserOutlined />}>
          <Link to="/brand-managers">Brand Managers</Link>
        </Menu.Item> */}
      </SubMenu>
      <SubMenu key="settings" icon={<SettingOutlined />} title="Settings">
        <Menu.Item key="settings_access-control" icon={<ControlOutlined />}>
          <Link to="/settings_access-control">Access Control</Link>
        </Menu.Item>
        <Menu.Item key="settings_data-management" icon={<ToolOutlined />}>
          <Link to="/settings_data-management">Data Management</Link>
        </Menu.Item>
        <Menu.Item key="settings_endpoints" icon={<CloudServerOutlined />}>
          <Link to="/settings_endpoints">Endpoints</Link>
        </Menu.Item>
        {/* <Menu.Item key="interfaces" icon={<AppstoreAddOutlined />}>
        <Link to="/interfaces">Interfaces</Link>
      </Menu.Item> */}
        <Menu.Item key="settings_roles" icon={<ApartmentOutlined />}>
          <Link to="/settings_roles">Roles</Link>
        </Menu.Item>
        <Menu.Item key="settings_settings" icon={<SettingOutlined />}>
          <Link to="/settings_settings">Settings</Link>
        </Menu.Item>
        <Menu.Item key="settings_categories" icon={<BarsOutlined />}>
          <Link to="/settings_categories">Categories</Link>
        </Menu.Item>
        <Menu.Item key="settings_interests" icon={<LikeOutlined />}>
          <Link to="/settings_interests">Interests</Link>
        </Menu.Item>
        <Menu.Item key="settings_trends" icon={<LineChartOutlined />}>
          <Link to="/settings_trends">Trends</Link>
        </Menu.Item>
        <Menu.Item key="settings_dd-templates" icon={<FileDoneOutlined />}>
          <Link to="/settings_dd-templates">DD Templates</Link>
        </Menu.Item>
        <Menu.Item key="settings_fan-groups" icon={<TeamOutlined />}>
          <Link to="/settings_fan-groups">Fan Groups</Link>
        </Menu.Item>
        <Menu.Item key="settings_tags" icon={<TagOutlined />}>
          <Link to="/settings_tags">Tags</Link>
        </Menu.Item>
        <Menu.Item key="settings_push-group-tag" icon={<ToTopOutlined />}>
          <Link to="/settings_push-group-tag">Push Group Tag</Link>
        </Menu.Item>
        <Menu.Item key="settings_master-password" icon={<LockOutlined />}>
          <Link to="/settings_master-password">Master Password</Link>
        </Menu.Item>
      </SubMenu>
    </Menu>
  );
};

export default AdminSideMenu;
