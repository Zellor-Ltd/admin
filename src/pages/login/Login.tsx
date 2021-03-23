import { Button, Card, Form, Input } from "antd";
import { RouteComponentProps } from "react-router";
import { loginService } from "services/DiscoClubService";

const Login: React.FC<RouteComponentProps> = (props) => {
  const { history } = props;
  const onFinish = async (values: any) => {
    const response: any = await loginService(values);

    if (response.success) {
      localStorage.setItem("token", response.token);
      history.push("/");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Card>
      <Form
        name="auth"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}>
        <Form.Item
          label="Username"
          name="user"
          rules={[{ required: true, message: "Please input your username!" }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="pwd"
          rules={[{ required: true, message: "Please input your password!" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default Login;
