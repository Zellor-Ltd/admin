import { TagOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const AdminSideMenu = () => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
      <Menu.Item key="products" icon={<TagOutlined />}>
        <Link to="/products">Products</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
