import { Button, Card, Form, Input } from 'antd';
import { AppContext } from 'contexts/AppContext';
import { useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { fetchClient, loginService } from 'services/DiscoClubService';

const Login: React.FC<RouteComponentProps> = props => {
  const { history } = props;
  const [loading, setLoading] = useState(false);
  const { client, setClient } = useContext(AppContext);

  useEffect(() => {
    /* if (
      !client?.clientName ||
      !client?.clientLink ||
      !client?.currencyCode ||
      !client?.jumpUrl ||
      !client?.redirectUrl ||
      !client?.shopName
    )
      history.push('/my-account');
    else */
    /* history.push('/'); */
  }, [client]);

  const loadClientInfo = async () => {
    const response: any = await fetchClient();
    if (response.success) {
      setClient(response.result.client);
    }
  };

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
          rules={[{ required: true, message: 'Please input your username!' }]}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          label="Password"
          name="pwd"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password allowClear />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Login;
