import {
  FundOutlined,
  TagOutlined,
  HeartFilled,
  LinkOutlined,
  HddOutlined,
} from '@ant-design/icons';
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
        key="products"
        icon={<TagOutlined />}
        onClick={() => refreshParent('products')}
      >
        <Link to="/products">Products</Link>
      </Menu.Item>
      <Menu.Item
        key="feed"
        icon={<HeartFilled />}
        onClick={() => refreshParent('feed')}
      >
        <Link to="/feed">Videos Feed</Link>
      </Menu.Item>
      <Menu.Item
        key="play-lists"
        icon={<LinkOutlined />}
        onClick={() => refreshParent('play-lists')}
      >
        <Link to="/play-lists">Play Lists</Link>
      </Menu.Item>
      <Menu.Item
        key="play-list-studio"
        icon={<HddOutlined />}
        onClick={() => refreshParent('play-list-studio')}
      >
        <Link to="/play-list-studio">Play List Studio</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
