import {
  Avatar,
  Button,
  Col,
  Dropdown,
  Layout,
  Menu,
  message,
  Row,
} from 'antd';
import ErrorBoundary from 'components/ErrorBoundary';
import jwt from 'helpers/jwt';
import ErrorPage from 'pages/error/ErrorPage';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import './AuthenticatedLayout.scss';
import AdminSideMenu from './SideMenus/AdminSideMenu';
import { DownOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const AuthenticatedLayout: React.FC<RouteComponentProps> = props => {
  const { isMobile, isScrollable, setIsScrollable } = useContext(AppContext);
  const { children, history, location } = props;
  const scrollable = [
    'dashboard',
    'client-dashboard',
    'access-control',
    'settings',
    'widgets',
    'sign-up',
    'my-account',
  ];
  const [style, setStyle] = useState<any>({
    padding: '24 0',
    minHeight: 280,
    overflow: 'clip scroll',
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

  const appName = 'Portal Admin';

  const logout = () => {
    localStorage.clear();
    history.push('/login');
  };

  const getUserName = () => {
    const user: any = jwt.decode(localStorage.getItem('token') || '');
    if (user) return user.username;
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
              <Avatar
                className="ml-1"
                style={{ backgroundColor: 'white', color: '#212427' }}
              >
                {getUserName()[0].toUpperCase()}
              </Avatar>
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
        <div className="sider-container">
          <Sider breakpoint="lg" collapsedWidth="0">
            <AdminSideMenu />
          </Sider>
        </div>
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
