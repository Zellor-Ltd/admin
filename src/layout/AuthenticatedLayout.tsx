import { Link, withRouter } from "react-router-dom";
import { Layout, Menu } from "antd";
import { HeartFilled, BookFilled } from "@ant-design/icons";
import "./AuthenticatedLayout.scss";

const { Header, Sider, Content } = Layout;

const AuthenticatedLayout: React.FC = (props) => {
  const { children } = props;
  return (
    <Layout>
      <Header className="header">
        <h2>
          <Link to="/"> Disco Admin</Link>
        </h2>
      </Header>
      <Layout className="site-layout">
        <Sider breakpoint="lg" collapsedWidth="0">
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item key="2" icon={<HeartFilled />}>
              <Link to="/video-feed">Videos Feed</Link>
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
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default withRouter(AuthenticatedLayout);
