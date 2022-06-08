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
  ToolOutlined,
  BarsOutlined,
  LikeOutlined,
  FileDoneOutlined,
  ToTopOutlined,
  LockOutlined,
  PicCenterOutlined,
  RocketOutlined,
  BarcodeOutlined,
  ShoppingOutlined,
  MobileOutlined,
  ShopOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import scrollIntoView from 'scroll-into-view';

const AdminSideMenu = isMobile => {
  const [, pathname] = useLocation().pathname.split('/');
  const [parentMenu] = pathname.split('_');
  const lastMenuItem = document.querySelector('.last-menu-item');
  const [lastDisplayedMenuItem, setLastDisplayedMenuItem] = useState<string>();
  const [showSiderArrow, setShowSiderArrow] = useState<boolean>(
    window.innerHeight < 700
  );

  const handleResize = () => {
    if (window.innerWidth < 700) {
      setShowSiderArrow(true);
    } else {
      setShowSiderArrow(false);
    }

    //setar o novo last displayed menu item: de baixo pra cima, o primeiro que tem lower bound <= janela.height
    //ultimo click: oculta o arrow
    //habilitar upper arrow no primeiro click, logica inversa
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  useEffect(() => {
    for (let i = 13; i--; i > 0) {
      const menuItem = document.querySelector(
        `.scrollable-row-${i}`
      ) as HTMLElement;
      if (menuItem && isInViewport(menuItem)) {
        //do what???
      }
    }
  });

  const isInViewport = (element: HTMLElement) => {
    var bounds = element.getBoundingClientRect();
    return (
      bounds.top >= 0 &&
      bounds.left >= 0 &&
      bounds.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      bounds.right <=
        (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  const handleScrollDown = () => {
    for (let i = 3; i--; i > 0) {
      const increment = i; //1 = lastShown
      if (document.querySelector(`.scrollable-row-${1 + increment}`)) {
        scrollIntoView(
          document.querySelector(
            `.scrollable-row-${1 + increment}`
          ) as HTMLElement
        );
      }
    }
  };

  return (
    <>
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
        <SubMenu
          key="reports"
          icon={<LineChartOutlined />}
          title="Reports"
          className="scrollable-row-1"
        >
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
          className="scrollable-row-2"
        >
          <Link to="/brands">Master Brands</Link>
        </Menu.Item>
        <Menu.Item
          key="product-brands"
          icon={<TagOutlined />}
          className="scrollable-row-3"
        >
          <Link to="/product-brands">Product Brands</Link>
        </Menu.Item>
        <Menu.Item
          key="products"
          icon={<ShoppingCartOutlined />}
          className="scrollable-row-4"
        >
          <Link to="/products">Live Products</Link>
        </Menu.Item>
        <Menu.Item
          key="preview-products"
          icon={<IssuesCloseOutlined />}
          className="scrollable-row-5"
        >
          <Link to="/preview-products">Preview Products</Link>
        </Menu.Item>
        <Menu.Item
          key="feed"
          icon={<MobileOutlined />}
          className="scrollable-row-6"
        >
          <Link to="/feed">Video Feeds</Link>
        </Menu.Item>
        <Menu.Item
          key="feed-templates"
          icon={<PicCenterOutlined />}
          className="scrollable-row-7"
        >
          <Link to="/feed-templates">Feed Templates</Link>
        </Menu.Item>
        <Menu.Item
          key="orders"
          icon={<ShoppingOutlined />}
          className="scrollable-row-8"
        >
          <Link to="/orders">Orders</Link>
        </Menu.Item>
        <Menu.Item
          key="wallets"
          icon={<DollarOutlined />}
          className="scrollable-row-9"
        >
          <Link to="/wallets">Wallets</Link>
        </Menu.Item>
        <Menu.Item
          key="transactions"
          icon={<BarcodeOutlined />}
          className="scrollable-row-10"
        >
          <Link to="/transactions">Transactions</Link>
        </Menu.Item>
        <SubMenu
          key="marketing"
          icon={<RocketOutlined />}
          title="Marketing"
          className="scrollable-row-11"
        >
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
        <SubMenu
          key="users"
          icon={<TeamOutlined />}
          title="Users"
          className="scrollable-row-12"
        >
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
        <SubMenu
          key="settings"
          icon={<SettingOutlined />}
          title="Settings"
          className="scrollable-row-13 last-menu-item"
        >
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
      <div
        style={showSiderArrow ? {} : { display: 'none' }}
        className="sider-arrow"
      >
        <DownOutlined />
      </div>
    </>
  );
};

export default AdminSideMenu;
