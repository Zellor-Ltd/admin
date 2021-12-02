import { Layout } from 'antd';
import './AuthenticatedLayout.scss';
const { Content } = Layout;

const OpenLayout: React.FC = props => {
  const { children } = props;
  return (
    <Layout style={{ height: '100vh' }}>
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
