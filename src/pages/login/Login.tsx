import { Button, Card, Col, Form, Input, PageHeader, Row } from 'antd';
import SignUp from 'pages/sign-up/SignUp';
import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { loginService } from 'services/DiscoClubService';

const Login: React.FC<RouteComponentProps> = props => {
  const { history } = props;
  const [loading, setLoading] = useState(false);
  const [signUp, setSignUp] = useState<boolean>();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response: any = await loginService(values);
      if (response.success) {
        localStorage.setItem('token', response.token);
        history.push('/');
      }
    } catch (e) {}
    setLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    if (signUp) history.push('/sign-up');
    else history.goBack();
  }, [signUp]);

  return (
    <>
      {!signUp && (
        <Card>
          <Form
            name="auth"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Username"
              name="user"
              rules={[
                { required: true, message: 'Please input your username!' },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label="Password"
              name="pwd"
              rules={[
                { required: true, message: 'Please input your password!' },
              ]}
            >
              <Input.Password allowClear />
            </Form.Item>
            <Row justify="space-between" style={{ alignItems: 'baseline' }}>
              <Col>
                <Button type="text" onClick={() => setSignUp(true)}>
                  Sign up
                </Button>
              </Col>
              <Col>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Submit
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      )}
      {signUp && (
        <>
          <PageHeader title="hi" />
          <Card>
            <Form
              name="client"
              initialValues={undefined}
              onFinish={() => console.log('hi')}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Organisation Name"
                name="organisation"
                rules={[
                  {
                    required: true,
                    message: 'Please input your Organisation name!',
                  },
                ]}
              >
                <Input allowClear />
              </Form.Item>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: 'Please input your First name!' },
                ]}
              >
                <Input allowClear />
              </Form.Item>
              <Form.Item
                label="Second Name"
                name="secondName"
                rules={[
                  { required: true, message: 'Please input your Second name!' },
                ]}
              >
                <Input allowClear />
              </Form.Item>
              <Form.Item
                label="E-mail address"
                name="user"
                rules={[
                  {
                    required: true,
                    message: 'Please input your e-mail address!',
                  },
                ]}
              >
                <Input allowClear />
              </Form.Item>
              <Form.Item
                label="Password"
                name="pwd"
                rules={[
                  { required: true, message: 'Please select a password!' },
                ]}
              >
                <Input.Password allowClear />
              </Form.Item>
              <Row justify="space-between">
                <Col>
                  <Button onClick={() => setSignUp(false)} loading={loading}>
                    Cancel
                  </Button>
                </Col>
                <Col>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      Sign up
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </>
      )}
    </>
  );
};

export default Login;
