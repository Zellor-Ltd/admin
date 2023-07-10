import { Col, Image, Layout, Row } from 'antd';
import './AuthenticatedLayout.scss';
import { Header } from 'antd/lib/layout/layout';
import { useBuildTarget } from 'hooks/useBuildTarget';
import { Link, RouteComponentProps } from 'react-router-dom';
import { AppContext } from 'contexts/AppContext';
import { useContext } from 'react';
const { Content } = Layout;

const OpenLayout: React.FC<RouteComponentProps> = props => {
  const { children } = props;
  const { isMobile } = useContext(AppContext);

  const appName = useBuildTarget({
    ADMIN: (
      <Image
        width={150}
        style={{ position: 'relative', inset: '-5px -10px' }}
        src="/logowhite.svg"
        preview={false}
      />
    ),
    BRAND_MANAGER: (
      <Image
        width={150}
        style={{ position: 'relative', inset: '-5px -10px' }}
        src="/logowhite.svg"
        preview={false}
      />
    ),
  });

  return (
    <Layout style={{ height: '100vh' }}>
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
        </Row>
      </Header>
      <Content
        style={{
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default OpenLayout;
