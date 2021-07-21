import {
  ApartmentOutlined,
  CloudServerOutlined,
  ControlOutlined,
  DollarOutlined,
  FundOutlined,
  HeartFilled,
  MobileOutlined,
  OrderedListOutlined,
  SettingOutlined,
  // AppstoreAddOutlined,
  ShoppingCartOutlined,
  SwitcherOutlined,
  TagOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import { Link } from "react-router-dom";

const AdminSideMenu = () => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
      <Menu.Item key="dashboard" icon={<FundOutlined />}>
        <Link to="/dashboard">Dashboard</Link>
      </Menu.Item>
      <Menu.Item key="brands" icon={<FundOutlined />}>
        <Link to="/brands">Brands</Link>
      </Menu.Item>
      <Menu.Item key="preview" icon={<MobileOutlined />}>
        <Link to="/preview">Preview</Link>
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
      <Menu.Item key="promotions" icon={<DollarOutlined />}>
        <Link to="/promotions">Promotions</Link>
      </Menu.Item>
      <Menu.Item key="transactions" icon={<DollarOutlined />}>
        <Link to="/transactions">Transactions</Link>
      </Menu.Item>
      <SubMenu key="sub-settings" icon={<SettingOutlined />} title="Settings">
        <Menu.Item key="endpoints" icon={<CloudServerOutlined />}>
          <Link to="/endpoints">Endpoints</Link>
        </Menu.Item>
        {/* <Menu.Item key="interfaces" icon={<AppstoreAddOutlined />}>
        <Link to="/interfaces">Interfaces</Link>
      </Menu.Item> */}
        <Menu.Item key="fans" icon={<UserOutlined />}>
          <Link to="/fans">Fans</Link>
        </Menu.Item>
        <Menu.Item key="roles" icon={<ApartmentOutlined />}>
          <Link to="/roles">Roles</Link>
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
        <Menu.Item key="access-control" icon={<ControlOutlined />}>
          <Link to="/access-control">Access Control</Link>
        </Menu.Item>
        <Menu.Item key="creators" icon={<TeamOutlined />}>
          <Link to="/creators">Creators</Link>
        </Menu.Item>
        <Menu.Item key="tags" icon={<TagOutlined />}>
          <Link to="/tags">Tags</Link>
        </Menu.Item>
        <Menu.Item key="categories" icon={<SwitcherOutlined />}>
          <Link to="/categories">Categories</Link>
        </Menu.Item>
        <Menu.Item key="promo-codes" icon={<SwitcherOutlined />}>
          <Link to="/promo-codes">Promo Codes</Link>
        </Menu.Item>
      </SubMenu>
    </Menu>
  );
};

export default AdminSideMenu;
