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
  DashboardOutlined,
  LineChartOutlined,
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
} from '@ant-design/icons';
import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { Link, useHistory, useLocation } from 'react-router-dom';

const AdminSideMenu = ({ isMobile }) => {
  const [, pathname] = useLocation().pathname.split('/');
  const [parentMenu] = pathname.split('_');
  const history = useHistory();

  const refreshParent = (path: string) => {
    if (pathname === path) history.go(0);
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={[pathname]}
      defaultOpenKeys={[parentMenu]}
    >
      <Menu.Item
        style={isMobile ? { marginTop: 0 } : {}}
        key="dashboard"
        icon={<DashboardOutlined />}
      >
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
      <Menu.Item
        key="brands"
        icon={<ShopOutlined />}
        onClick={() => refreshParent('brands')}
      >
        <Link to="/brands">Master Brands</Link>
      </Menu.Item>
      <Menu.Item
        key="product-brands"
        icon={<TagOutlined />}
        onClick={() => refreshParent('product-brands')}
      >
        <Link to="/product-brands">Product Brands</Link>
      </Menu.Item>
      <Menu.Item
        key="products"
        icon={<ShoppingOutlined />}
        onClick={() => refreshParent('products')}
      >
        <Link to="/products">Live Products</Link>
      </Menu.Item>
      <Menu.Item
        key="preview-products"
        icon={<IssuesCloseOutlined />}
        onClick={() => refreshParent('preview-products')}
      >
        <Link to="/preview-products">Preview Products</Link>
      </Menu.Item>
      <Menu.Item
        key="variant_groups"
        icon={<PartitionOutlined />}
        onClick={() => refreshParent('variant_groups')}
      >
        <Link to="/variant_groups">Variant Groups</Link>
      </Menu.Item>
      <Menu.Item
        key="feed"
        icon={<MobileOutlined />}
        onClick={() => refreshParent('feed')}
      >
        <Link to="/feed">Video Feeds</Link>
      </Menu.Item>
      <Menu.Item
        key="fan-videos"
        icon={<UsergroupAddOutlined />}
        onClick={() => refreshParent('fan-videos')}
      >
        <Link to="/fan-videos">Fan Videos</Link>
      </Menu.Item>
      <SubMenu key="templates" icon={<BlockOutlined />} title="Templates">
        <Menu.Item
          key="product-templates"
          icon={<ShoppingOutlined />}
          onClick={() => refreshParent('product-templates')}
        >
          <Link to="/product-templates">Product Templates</Link>
        </Menu.Item>
        <Menu.Item
          key="feed-templates"
          icon={<MobileOutlined />}
          onClick={() => refreshParent('feed-templates')}
        >
          <Link to="/feed-templates">Feed Templates</Link>
        </Menu.Item>
        <Menu.Item
          key="dd-templates"
          icon={<CreditCardOutlined />}
          onClick={() => refreshParent('dd-templates')}
        >
          <Link to="/dd-templates">DD Templates</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="finance" icon={<DollarOutlined />} title="Finance">
        <Menu.Item
          key="payments"
          icon={<PercentageOutlined />}
          onClick={() => refreshParent('payments')}
        >
          <Link to="/payments">Payments</Link>
        </Menu.Item>
        <Menu.Item
          key="payment-history"
          icon={<ScheduleOutlined />}
          onClick={() => refreshParent('payment-history')}
        >
          <Link to="/payment-history">Payment History</Link>
        </Menu.Item>
        <Menu.Item
          key="orders"
          icon={<ShoppingCartOutlined />}
          onClick={() => refreshParent('orders')}
        >
          <Link to="/orders">Orders</Link>
        </Menu.Item>
        <Menu.Item
          key="wallets"
          icon={<WalletOutlined />}
          onClick={() => refreshParent('wallets')}
        >
          <Link to="/wallets">Wallets</Link>
        </Menu.Item>
      </SubMenu>
      <Menu.Item
        key="transactions"
        icon={<UnorderedListOutlined />}
        onClick={() => refreshParent('transactions')}
      >
        <Link to="/transactions">Transactions</Link>
      </Menu.Item>
      <SubMenu key="marketing" icon={<RocketOutlined />} title="Marketing">
        <Menu.Item
          key="marketing_creators-list"
          icon={<UserOutlined />}
          onClick={() => refreshParent('marketing_creators-list')}
        >
          <Link to="/marketing_creators-list">Creator List</Link>
        </Menu.Item>
        <Menu.Item
          key="marketing_home-screen"
          icon={<IdcardOutlined />}
          onClick={() => refreshParent('marketing_home-screen')}
        >
          <Link to="/marketing_home-screen">Home Screen</Link>
        </Menu.Item>
        <Menu.Item
          key="marketing_promo-displays"
          icon={<GiftOutlined />}
          onClick={() => refreshParent('marketing_promo-displays')}
        >
          <Link to="/marketing_promo-displays">Shop Display</Link>
        </Menu.Item>
        <Menu.Item
          key="marketing_promotions"
          icon={<SoundOutlined />}
          onClick={() => refreshParent('marketing_promotions')}
        >
          <Link to="/marketing_promotions">Promotions</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="users" icon={<TeamOutlined />} title="Users">
        <Menu.Item
          key="users_fans"
          icon={<UserOutlined />}
          onClick={() => refreshParent('users_fans')}
        >
          <Link to="/users_fans">Fans</Link>
        </Menu.Item>
        <Menu.Item
          key="users_guests"
          icon={<UserOutlined />}
          onClick={() => refreshParent('users_guests')}
        >
          <Link to="/users_guests">Guests</Link>
        </Menu.Item>
        <Menu.Item
          key="creators"
          icon={<UserOutlined />}
          onClick={() => refreshParent('users_creators')}
        >
          <Link to="/users_creators">Creators</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="settings" icon={<SettingOutlined />} title="Settings">
        <Menu.Item key="settings_access-control" icon={<ControlOutlined />}>
          <Link to="/settings_access-control">Access Control</Link>
        </Menu.Item>
        <Menu.Item
          key="settings_endpoints"
          icon={<CloudServerOutlined />}
          onClick={() => refreshParent('settings_endpoints')}
        >
          <Link to="/settings_endpoints">Endpoints</Link>
        </Menu.Item>
        <Menu.Item
          key="settings_roles"
          icon={<ApartmentOutlined />}
          onClick={() => refreshParent('settings_roles')}
        >
          <Link to="/settings_roles">Roles</Link>
        </Menu.Item>
        <Menu.Item key="settings_settings" icon={<SettingOutlined />}>
          <Link to="/settings_settings">Settings</Link>
        </Menu.Item>
        <Menu.Item
          key="settings_categories"
          icon={<BarsOutlined />}
          onClick={() => refreshParent('settings_categories')}
        >
          <Link to="/settings_categories">Categories</Link>
        </Menu.Item>
        <Menu.Item key="settings_interests" icon={<LikeOutlined />}>
          <Link to="/settings_interests">Interests</Link>
        </Menu.Item>
        <Menu.Item key="settings_trends" icon={<LineChartOutlined />}>
          <Link to="/settings_trends">Trends</Link>
        </Menu.Item>
        <Menu.Item key="settings_fixed-videos" icon={<PlaySquareOutlined />}>
          <Link to="/settings_fixed-videos">Fixed Videos</Link>
        </Menu.Item>
        <Menu.Item
          key="settings_fan-groups"
          icon={<TeamOutlined />}
          onClick={() => refreshParent('settings_fan-groups')}
        >
          <Link to="/settings_fan-groups">Fan Groups</Link>
        </Menu.Item>
        <Menu.Item
          key="settings_tags"
          icon={<TagOutlined />}
          onClick={() => refreshParent('settings_tags')}
        >
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
