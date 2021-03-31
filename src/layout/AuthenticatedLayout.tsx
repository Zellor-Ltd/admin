import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import { Button, Layout, Menu, Typography } from "antd";
import {
  HeartFilled,
  TagOutlined,
  TeamOutlined,
  FundOutlined,
  CloudServerOutlined,
  UserOutlined,
  SettingOutlined,
  ApartmentOutlined,
  AppstoreAddOutlined,
  ControlOutlined,
} from "@ant-design/icons";
import "./AuthenticatedLayout.scss";
import jwt from "helpers/jwt";
import SubMenu from "antd/lib/menu/SubMenu";

const { Header, Sider, Content } = Layout;

const AuthenticatedLayout: React.FC<RouteComponentProps> = (props) => {
  const { children, history } = props;

  const logout = () => {
    localStorage.clear();
    history.push("/login");
  };

  const getUserName = () => {
    const user: any = jwt.decode(localStorage.getItem("token") || "");
    return user.name;
  };

  return (
    <Layout>
      <Header className="header">
        <h2>
          <Link to="/"> Disco Admin</Link>
        </h2>
        <div>
          <Typography.Text style={{ color: "white" }}>
            {getUserName()}
          </Typography.Text>
          <Button onClick={logout} type="link">
            Logout
          </Button>
        </div>
      </Header>
      <Layout className="site-layout">
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            minHeight: "calc(100vh - 64px)",
          }}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item key="brands" icon={<FundOutlined />}>
              <Link to="/brands">Brands</Link>
            </Menu.Item>
            <Menu.Item key="products" icon={<TagOutlined />}>
              <Link to="/products">Products</Link>
            </Menu.Item>
            <Menu.Item key="creators" icon={<TeamOutlined />}>
              <Link to="/creators">Creators</Link>
            </Menu.Item>
            <Menu.Item key="tags" icon={<TagOutlined />}>
              <Link to="/tags">Tags</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<HeartFilled />}>
              <Link to="/feed">Videos Feed</Link>
            </Menu.Item>

            <SubMenu
              key="sub-settings"
              icon={<SettingOutlined />}
              title="Settings">
              <Menu.Item key="endpoints" icon={<CloudServerOutlined />}>
                <Link to="/endpoints">Endpoints</Link>
              </Menu.Item>
              <Menu.Item key="interfaces" icon={<AppstoreAddOutlined />}>
                <Link to="/interfaces">Interfaces</Link>
              </Menu.Item>
              <Menu.Item key="users" icon={<UserOutlined />}>
                <Link to="/users">Users</Link>
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
            </SubMenu>
          </Menu>
        </Sider>

        <Content
          className="site-layout-background"
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
          }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default withRouter(AuthenticatedLayout);
