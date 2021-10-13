import { Button, Col, Dropdown, Layout, Menu, Row, Typography } from "antd";
import ErrorBoundary from "components/ErrorBoundary";
import jwt from "helpers/jwt";
import { useBuildTarget } from "hooks/useBuildTarget";
import ErrorPage from "pages/error/ErrorPage";
import { Link, RouteComponentProps, withRouter } from "react-router-dom";
import "./AuthenticatedLayout.scss";
import AdminSideMenu from "./SideMenus/AdminSideMenu";
import BrandManagerSideMenu from "./SideMenus/BrandManagerSideMenu";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";

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

  const [showAlerts, setShowAlerts] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([
    "Error Error Error Error Error Error Error Error Error ErrorError 1",
    "Error 2",
    "Error 3",
    "Error 4",
    "Error 5",
    "Error 6",
    "Error 7",
    "Error 8",
    "Error 9",
  ]);

  const removeMessage = (index: number) => {
    setMessages([...messages.slice(0, index), ...messages.slice(index + 1)]);
  };

  const menu = (
    <Menu
      style={{
        width: "220px",
        maxHeight: "320px",
        overflowY: messages.length ? "scroll" : "initial",
      }}
    >
      {messages.length ? (
        messages.map((message, index) => (
          <>
            <Menu.Item>
              <Row>
                <Col xs={20}>
                  <div
                    style={{
                      padding: "8px 0 0 0",
                      whiteSpace: "initial",
                      wordWrap: "break-word",
                    }}
                  >
                    {message}
                  </div>
                </Col>
                <Col xs={4}>
                  <Button
                    type="link"
                    size="large"
                    onClick={() => removeMessage(index)}
                    icon={<CloseOutlined />}
                  />
                </Col>
              </Row>
            </Menu.Item>
            <Menu.Divider />
          </>
        ))
      ) : (
        <Menu.Item>There are no messages.</Menu.Item>
      )}
    </Menu>
  );

  const handleVisibleChange = (flag: boolean) => {
    setShowAlerts(flag);
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
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                onVisibleChange={handleVisibleChange}
                visible={showAlerts}
              >
                <Button
                  style={{
                    height: "100%",
                    backgroundColor: "rgb(0 21 41)",
                    borderColor: "rgb(0 21 41)",
                    marginRight: "20px",
                  }}
                  shape="circle"
                  size="large"
                  onClick={(e) => e.preventDefault()}
                  icon={<BellOutlined style={{ color: "white" }} />}
                />
              </Dropdown>
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
