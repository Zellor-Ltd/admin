import { Button, Col, Form, Image, Input, Row, Typography } from 'antd';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

const ForgotPassword: React.FC<RouteComponentProps> = props => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // const response: any = await console.log('hi'); /* loginService(values) */
      /* if (response.success) {
        localStorage.setItem('token', response.token);
      } */
      history.push('/verification');
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
          <Row justify="center" style={{ width: '100%' }}>
            <Col span={24}>
              <Image
                width="100%"
                style={{ padding: '5% 10%' }}
                src="/logo.svg"
              />
            </Col>
            <Typography.Title level={4}>
              <strong>New Password</strong>
            </Typography.Title>
            <Col span={24}>
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
                  label={<strong>Email</strong>}
                  name="email"
                  className="mb-05"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                  ]}
                >
                  <Input allowClear />
                </Form.Item>
                <Form.Item
                  label={<strong>New Password</strong>}
                  name="pwd"
                  className="mb-05"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your new password!',
                    },
                  ]}
                >
                  <Input.Password allowClear />
                </Form.Item>
                <Row justify="end" style={{ alignItems: 'baseline' }}>
                  <Col span={24}>
                    <Form.Item className="my-1">
                      <Button
                        type="primary"
                        htmlType="submit"
                        style={{ background: 'rgb(48,86,211)', width: '100%' }}
                        loading={loading}
                      >
                        Submit
                      </Button>
                    </Form.Item>
                    <Button
                      className="mb-1"
                      style={{ width: '100%' }}
                      onClick={() => history.goBack()}
                      loading={loading}
                    >
                      Cancel
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
