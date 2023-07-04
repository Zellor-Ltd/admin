import { Button, Card, Col, Form, Input, PageHeader, Row } from 'antd';
import { useState } from 'react';
import { Link, RouteComponentProps, useHistory } from 'react-router-dom';
import { loginService } from 'services/DiscoClubService';

const SignUp: React.FC<any> = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
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
              { required: true, message: 'Please input your e-mail address!' },
            ]}
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item
            label="Password"
            name="pwd"
            rules={[{ required: true, message: 'Please select a password!' }]}
          >
            <Input.Password allowClear />
          </Form.Item>
          <Row justify="space-between">
            <Col>
              <Button onClick={() => history.goBack()} loading={loading}>
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
  );
};

export default SignUp;
