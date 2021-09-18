import {
  ApartmentOutlined,
  CloudServerOutlined,
  ControlOutlined,
  DollarOutlined,
  FireOutlined,
  FundOutlined,
  GiftOutlined,
  HeartFilled,
  OrderedListOutlined,
  SettingOutlined,
  // AppstoreAddOutlined,
  ShoppingCartOutlined,
  SoundOutlined,
  SwitcherOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import { Link, useLocation } from "react-router-dom";

const AdminSideMenu = () => {
  const [, pathname] = useLocation().pathname.split("/");
  const [parentMenu] = pathname.split("_");

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={[pathname]}
      defaultOpenKeys={[parentMenu]}
    >
      <Menu.Item key="dashboard" icon={<FundOutlined />}>
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="brands" icon={<FundOutlined />}>
        <Link to="/brands">Brands</Link>
      </Menu.Item>
      <Menu.Item key="products" icon={<TagOutlined />}>
        <Link to="/products">Products</Link>
      </Menu.Item>
      <Menu.Item key="staging-products" icon={<TagOutlined />}>
        <Link to="/staging-products">Staging</Link>
      </Menu.Item>
      <Menu.Item key="2" icon={<HeartFilled />}>
        <Link to="/feed">Videos Feed</Link>
      </Menu.Item>
      <Menu.Item key="feed-mixer" icon={<OrderedListOutlined />}>
        <Link to="/feed-mixer">Feed Mixer</Link>
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
        <Menu.Item key="marketing_promotions" icon={<SoundOutlined />}>
          <Link to="/marketing_promotions">Promotions</Link>
        </Menu.Item>
        <Menu.Item key="marketing_promo-displays" icon={<GiftOutlined />}>
          <Link to="/marketing_promo-displays">Shop Display</Link>
        </Menu.Item>
      </SubMenu>
      <SubMenu key="users" icon={<TeamOutlined />} title="Users">
        <Menu.Item key="users_fans" icon={<UserOutlined />}>
          <Link to="/users_fans">Fans</Link>
        </Menu.Item>
        <Menu.Item key="creators" icon={<UserOutlined />}>
          <Link to="/users_creators">Creators</Link>
        </Menu.Item>
        {/* <Menu.Item key="brand-managers" icon={<UserOutlined />}>
          <Link to="/brand-managers">Brand Managers</Link>
        </Menu.Item> */}
      </SubMenu>
      <SubMenu key="settings" icon={<SettingOutlined />} title="Settings">
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
        <Menu.Item key="settings_access-control" icon={<ControlOutlined />}>
          <Link to="/settings_access-control">Access Control</Link>
        </Menu.Item>
        <Menu.Item key="settings_tags" icon={<TagOutlined />}>
          <Link to="/settings_tags">Tags</Link>
        </Menu.Item>
        <Menu.Item key="settings_categories" icon={<SwitcherOutlined />}>
          <Link to="/settings_categories">Categories</Link>
        </Menu.Item>
        <Menu.Item key="settings_interests" icon={<SwitcherOutlined />}>
          <Link to="/settings_interests">Interests</Link>
        </Menu.Item>
        <Menu.Item key="settings_promo-codes" icon={<SwitcherOutlined />}>
          <Link to="/settings_promo-codes">Promo Codes</Link>
        </Menu.Item>
        <Menu.Item key="settings_dd-templates" icon={<SwitcherOutlined />}>
          <Link to="/settings_dd-templates">DD Templates</Link>
        </Menu.Item>
        <Menu.Item key="settings_fan-groups" icon={<SwitcherOutlined />}>
          <Link to="/settings_fan-groups">Fans Groups</Link>
        </Menu.Item>
        <Menu.Item key="settings_master-password" icon={<SwitcherOutlined />}>
          <Link to="/settings_master-password">Master Password</Link>
        </Menu.Item>
      </SubMenu>
    </Menu>
  );
};

export default AdminSideMenu;
