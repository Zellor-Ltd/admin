import { TagOutlined, HeartFilled, ShoppingCartOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const AdminSideMenu = () => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={["staging-list"]}>
      <Menu.Item key="staging-list" icon={<TagOutlined />}>
        <Link to="/staging-list">Products</Link>
      </Menu.Item>
      <Menu.Item key="feed" icon={<HeartFilled />}>
        <Link to="/feed">Videos Feed</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<ShoppingCartOutlined />}>
        <Link to="/orders">Orders</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
