import { Layout, Menu } from "antd";
import { LineChartOutlined, HeartFilled, BookFilled } from "@ant-design/icons";
import "./AuthenticatedLayout.scss";

const { Header, Sider, Content } = Layout;

function AuthenticatedLayout() {
  return (
    <Layout style={{ height: "100vh" }}>
      <Header className="header">
        <h2>Disco Admin</h2>
      </Header>
      <Layout className="site-layout">
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1" icon={<LineChartOutlined />}>
              Dashboard
            </Menu.Item>
            <Menu.Item key="2" icon={<HeartFilled />}>
              Videos Feed
            </Menu.Item>
            <Menu.Item key="3" icon={<BookFilled />}>
              Coin Orders
            </Menu.Item>
          </Menu>
        </Sider>

        <Content
          className="site-layout-background"
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
          }}>
          Content
        </Content>
      </Layout>
    </Layout>
  );
}

export default AuthenticatedLayout;
