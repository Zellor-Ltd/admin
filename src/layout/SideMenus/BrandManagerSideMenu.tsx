import { TagOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const AdminSideMenu = () => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={["staging-list"]}>
      <Menu.Item key="staging-list" icon={<TagOutlined />}>
        <Link to="/staging-list">Products</Link>
      </Menu.Item>
    </Menu>
  );
};

export default AdminSideMenu;
