import {
  Avatar,
  Button,
  Col,
  Dropdown,
  Image,
  Layout,
  Menu,
  message,
  Row,
} from 'antd';
import ErrorBoundary from 'components/ErrorBoundary';
import jwt from 'helpers/jwt';
import { useBuildTarget } from 'hooks/useBuildTarget';
import ErrorPage from 'pages/error/ErrorPage';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import './AuthenticatedLayout.scss';
import AdminSideMenu from './SideMenus/AdminSideMenu';
import { DownOutlined } from '@ant-design/icons';
import ClientMenu from './ClientMenu';

const { Header, Sider, Content } = Layout;

const AuthenticatedLayout: React.FC<RouteComponentProps> = props => {
  const { isMobile, isScrollable, setIsScrollable } = useContext(AppContext);
  const { children, history, location } = props;
  const scrollable = [
    'dashboard',
    'client-dashboard',
    'access-control',
    'settings',
    'playlist-studio',
    'sign-up',
    'my-account',
  ];
  const [style, setStyle] = useState<any>({
    padding: '24 0',
    minHeight: 280,
    overflow: 'scroll',
    width: '100%',
  });

  useEffect(() => {
    if (scrollable.includes(location.pathname.slice(1))) setIsScrollable(true);
    else setIsScrollable(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    if (isScrollable)
      setStyle({
        padding: '24 0',
        minHeight: 280,
        overflow: 'scroll',
        width: '100%',
      });
    else
      setStyle({
        padding: '24 0',
        minHeight: 280,
        overflow: 'clip',
        width: '100%',
      });
  }, [isScrollable]);

  const appName = useBuildTarget({
    ADMIN: 'Disco Admin',
    BRAND_MANAGER: (
      <Image
        width={150}
        style={{ position: 'relative', inset: '-5px -10px' }}
        src="/logowhite.svg"
        preview={false}
      />
    ),
  });

  const logout = () => {
    localStorage.clear();
    history.push('/login');
  };

  const getUserName = () => {
    const user: any = jwt.decode(localStorage.getItem('token') || '');
    if (user) return user.name;
    else {
      message.error('Your session has expired, please login');
      logout();
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="0" style={{ pointerEvents: 'none' }}>
        {getUserName()}
      </Menu.Item>
      <Menu.Divider />
      {useBuildTarget({
        ADMIN: undefined,
        BRAND_MANAGER: (
          <Menu.Item key="1">
            <Link to="/my-account">My Account</Link>
          </Menu.Item>
        ),
      })}
      <Menu.Divider />
      <Menu.Item key="3" onClick={logout}>
        Sign out
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Header className="header">
        <h2 style={{ width: '65%' }}>
          <Link to="/">
            {appName}
            <small style={isMobile ? { display: 'none' } : { fontSize: 10 }}>
              &nbsp;&nbsp;{process.env.REACT_APP_BUILD_DATE || ''}
              &nbsp;|&nbsp;{process.env.REACT_APP_SERVER_ENV}
            </small>
          </Link>
        </h2>
        <Row style={{ width: '35%' }} justify="end" align="bottom" wrap={false}>
          <div>
            <Col xs={0} lg={24} style={{ textAlign: 'end' }}>
              {/* <Notifications /> */}
            </Col>
          </div>
          <div>
            <Col span={24} style={{ textAlign: 'end' }}>
              {getUserName()[0].toUpperCase()}
              <Avatar className="ml-1" style={{ backgroundColor: 'white' }} />
              <Dropdown overlay={menu} trigger={['click']}>
                <Button
                  type="text"
                  style={{ fontSize: '20px' }}
                  className="ant-dropdown-link"
                  onClick={e => e.preventDefault()}
                >
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Col>
          </div>
        </Row>
      </Header>
      <Layout>
        {useBuildTarget({
          ADMIN: undefined,
          BRAND_MANAGER: (
            <Row style={{ width: '100%' }}>
              <Col span={24}>
                <ClientMenu />
              </Col>
            </Row>
          ),
        })}
        {useBuildTarget({
          ADMIN: (
            <div className="sider-container">
              <Sider breakpoint="lg" collapsedWidth="0">
                <AdminSideMenu isMobile={isMobile} />
              </Sider>
            </div>
          ),
          BRAND_MANAGER: undefined,
        })}

        <Content className="site-layout-background" style={style}>
          <ErrorBoundary fallbackComponent={ErrorPage()}>
            {children}
          </ErrorBoundary>
        </Content>
      </Layout>
    </Layout>
  );
};

export default withRouter(AuthenticatedLayout);
