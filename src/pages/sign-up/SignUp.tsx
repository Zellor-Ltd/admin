import { Button, Col, Form, Image, Input, Row, Typography } from 'antd';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const SignUp: React.FC<any> = () => {
  const history = useHistory();
  const [loading] = useState(false);

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <div className="external-wrapper">
        <div className="external-container">
          <Image width="100%" style={{ padding: '5% 10%' }} src="/logo.svg" />
          <Typography.Title level={3}>Sign Up</Typography.Title>
          <Form
            name="client"
            layout="vertical"
            className="mt-1"
            initialValues={undefined}
            onFinish={() => console.log('hi')}
            onFinishFailed={onFinishFailed}
            requiredMark={false}
          >
            <Form.Item
              label={<strong>Organisation Name</strong>}
              name="organisation"
              className="mb-1"
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
              label={<strong>Name</strong>}
              name="firstName"
              className="mb-1"
              rules={[{ required: true, message: 'Please input your name!' }]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label={<strong>Surname</strong>}
              name="secondName"
              className="mb-1"
              rules={[
                { required: true, message: 'Please input your surname!' },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label={<strong>Email</strong>}
              name="user"
              className="mb-1"
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
              label={<strong>Password</strong>}
              name="pwd"
              className="mb-15"
              rules={[{ required: true, message: 'Please select a password!' }]}
            >
              <Input.Password allowClear />
            </Form.Item>
            <Row justify="center">
              <Col span={24}>
                <Form.Item className="mb-1">
                  <Button
                    style={{ background: 'rgb(48,86,211)', width: '100%' }}
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                    Sign up
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
        </div>
      </div>
    </>
  );
};

export default SignUp;
