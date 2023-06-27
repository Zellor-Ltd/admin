import { Button, Col, Layout, message, Row, Typography } from 'antd';
import ErrorBoundary from 'components/ErrorBoundary';
//import { Notifications } from 'components/Notifications';
import jwt from 'helpers/jwt';
import { useBuildTarget } from 'hooks/useBuildTarget';
import ErrorPage from 'pages/error/ErrorPage';
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import './AuthenticatedLayout.scss';
import AdminSideMenu from './SideMenus/AdminSideMenu';
import BrandManagerSideMenu from './SideMenus/BrandManagerSideMenu';

const { Header, Sider, Content } = Layout;

const AuthenticatedLayout: React.FC<RouteComponentProps> = props => {
  const { isMobile, isScrollable, setIsScrollable } = useContext(AppContext);
  const { children, history, location } = props;
  const scrollable = [
    'dashboard',
    'brand-dashboard',
    'access-control',
    'settings',
    'playlist-studio',
  ];
  const [style, setStyle] = useState<any>({
    padding: '24 0',
    minHeight: 280,
    overflow: 'scroll',
  });

  useEffect(() => {
    if (scrollable.includes(location.pathname.slice(1))) setIsScrollable(true);
    else setIsScrollable(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    if (isScrollable)
      setStyle({ padding: '24 0', minHeight: 280, overflow: 'scroll' });
    else setStyle({ padding: '24 0', minHeight: 280, overflow: 'clip' });
  }, [isScrollable]);

  const appName = useBuildTarget({
    ADMIN: 'Disco Admin',
    BRAND_MANAGER: 'Client Portal',
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
        <Row style={{ width: '35%' }} justify="end" wrap={false}>
          <div>
            <Col xs={0} lg={24} style={{ textAlign: 'end' }}>
              {/* <Notifications /> */}
            </Col>
          </div>
          <div>
            <Col xs={0} lg={24} style={{ textAlign: 'end' }}>
              <Typography.Text style={{ color: 'white' }}>
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
      <Layout>
        <div className="sider-container">
          <Sider breakpoint="lg" collapsedWidth="0">
            {useBuildTarget({
              ADMIN: <AdminSideMenu isMobile={isMobile} />,
              BRAND_MANAGER: <BrandManagerSideMenu />,
            })}
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
