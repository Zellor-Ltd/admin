import { Button, Col, Layout, Row, Typography } from "antd";
import ErrorBoundary from "components/ErrorBoundary";
import { Notifications } from "components/Notifications";
import jwt from "helpers/jwt";
import { useBuildTarget } from "hooks/useBuildTarget";
import ErrorPage from "pages/error/ErrorPage";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import "./AuthenticatedLayout.scss";
import AdminSideMenu from "./SideMenus/AdminSideMenu";
import BrandManagerSideMenu from "./SideMenus/BrandManagerSideMenu";

const { Header, Sider, Content } = Layout;

const AuthenticatedLayout: React.FC<RouteComponentProps> = (props) => {
  const { children, history } = props;

  const appName = useBuildTarget({
    ADMIN: "Disco Admin",
    BRAND_MANAGER: "Brand Manager",
  });

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
        <h2 style={{ width: "65%" }}>
          <Link to="/">
            {" "}
            {appName}{" "}
            <small style={{ fontSize: 10 }}>{`${
              process.env.REACT_APP_BUILD_DATE || ""
            } ${process.env.REACT_APP_SERVER_ENV}`}</small>
          </Link>
        </h2>
        <Row style={{ width: "35%" }} justify="end" wrap={false}>
          <div>
            <Col xs={0} md={24} style={{ textAlign: "end" }}>
              <Notifications />
            </Col>
          </div>
          <div>
            <Col xs={0} md={24} style={{ textAlign: "end" }}>
              <Typography.Text style={{ color: "white" }}>
                {getUserName()}
              </Typography.Text>
            </Col>
          </div>
          <div>
            <Button onClick={logout} type="link">
              Logout
            </Button>
          </div>
        </Row>
      </Header>
      <Layout className="site-layout">
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          style={{
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {useBuildTarget({
            ADMIN: <AdminSideMenu />,
            BRAND_MANAGER: <BrandManagerSideMenu />,
          })}
        </Sider>
        <Content
          className="site-layout-background"
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
          }}
        >
          <ErrorBoundary fallbackComponent={ErrorPage()}>
            {children}
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};

export default withRouter(AuthenticatedLayout);
