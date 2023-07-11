import { Button, Col, Form, Image, Input, Row, Typography } from 'antd';
import { useState } from 'react';
import { loginService } from 'services/DiscoClubService';
import { Link, RouteComponentProps } from 'react-router-dom';

const Login: React.FC<RouteComponentProps> = props => {
  const { history } = props;
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response: any = await loginService(values);
      if (response.success) {
        localStorage.setItem('token', response.token);
        /* loadClientInfo(); */
        history.push('/');
      }
    } catch (e) {}
    setLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <div className="external-wrapper">
        <div className="external-container">
          <Image
            width="100%"
            style={{ padding: '5% 10%' }}
            src="/logo.svg"
            preview={false}
          />
          <Typography.Title level={4}>
            <strong>Sign in to your account</strong>
          </Typography.Title>
          <Form
            name="auth"
            layout="vertical"
            className="mt-075"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            requiredMark={false}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label={<strong>Username</strong>}
              name="user"
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label={<strong>Password</strong>}
              name="pwd"
              className="mb-05"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password allowClear />
            </Form.Item>
            <Row justify="end" style={{ alignItems: 'baseline' }}>
              <Col className="mb-05">
                <Link to="/forgot-password">Forgot your password?</Link>
              </Col>
              <Col span={24}>
                <Form.Item className="mb-1">
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ background: 'rgb(48,86,211)', width: '100%' }}
                    loading={loading}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Col>
              <Col span={24} className="mb-1">
                <Row justify="center">
                  <Col>
                    <Typography.Text type="secondary" className="mr-15">
                      Don't have an account yet?
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Link to="/sign-up">Sign Up</Link>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};

export default Login;
