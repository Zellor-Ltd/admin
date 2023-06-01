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
      selectedKeys={[pathname]}
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
        key="variant-groups"
        icon={<PartitionOutlined />}
        onClick={() => refreshParent('variant-groups')}
      >
        <Link to="/variant-groups">Variant Groups</Link>
      </Menu.Item>
      <Menu.Item
        key="feed"
        icon={<MobileOutlined />}
        onClick={() => refreshParent('feed')}
      >
        <Link to="/feed">Video Feeds</Link>
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
      <Menu.Item
        key="featured-feeds"
        icon={<PicLeftOutlined />}
        onClick={() => refreshParent('featured-feeds')}
      >
        <Link to="/featured-feeds">Featured Feeds</Link>
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
      <SubMenu key="users" icon={<TeamOutlined />} title="Users">
        <Menu.Item
          key="fans"
          icon={<UserOutlined />}
          onClick={() => refreshParent('fans')}
        >
          <Link to="/fans">Fans</Link>
        </Menu.Item>
        <Menu.Item
          key="guests"
          icon={<UserOutlined />}
          onClick={() => refreshParent('guests')}
        >
          <Link to="/guests">Guests</Link>
        </Menu.Item>
        <Menu.Item
          key="creators"
          icon={<UserOutlined />}
          onClick={() => refreshParent('creators')}
        >
          <Link to="/creators">Creators</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="settings" icon={<SettingOutlined />} title="Settings">
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
      </SubMenu>
    </Menu>
  );
};

export default AdminSideMenu;
