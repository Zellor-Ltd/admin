import { Button, Col, Layout, Row, Typography } from 'antd';
import ErrorBoundary from 'components/ErrorBoundary';
import { Notifications } from 'components/Notifications';
import jwt from 'helpers/jwt';
import { useBuildTarget } from 'hooks/useBuildTarget';
import ErrorPage from 'pages/error/ErrorPage';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import './AuthenticatedLayout.scss';
import AdminSideMenu from './SideMenus/AdminSideMenu';
import BrandManagerSideMenu from './SideMenus/BrandManagerSideMenu';

const { Header, Sider, Content } = Layout;

const AuthenticatedLayout: React.FC<RouteComponentProps> = props => {
  const { children, history } = props;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 991);

  const handleResize = () => {
    if (window.innerWidth < 991) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
  });

  const appName = useBuildTarget({
    ADMIN: 'Disco Admin',
    BRAND_MANAGER: 'Brand Manager',
  });

  const logout = () => {
    localStorage.clear();
    history.push('/login');
  };

  const getUserName = () => {
    const user: any = jwt.decode(localStorage.getItem('token') || '');
    return user.name;
  };

  return (
    <Layout>
      <Header className="header">
        <h2 style={{ width: '65%' }}>
          <Link to="/">
            {appName}
            <small
              style={isMobile ? { display: 'none' } : { fontSize: 10 }}
            >{`${process.env.REACT_APP_BUILD_DATE || ''} ${
              process.env.REACT_APP_SERVER_ENV
            }`}</small>
          </Link>
        </h2>
        <Row style={{ width: '35%' }} justify="end" wrap={false}>
          <div>
            <Col xs={0} lg={24} style={{ textAlign: 'end' }}>
              <Notifications />
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
        <Content
          className="site-layout-background"
          style={{
            padding: '24 0',
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
