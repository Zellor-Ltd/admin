import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Select,
} from "antd";
import { RouteComponentProps } from "react-router";
import { useEffect, useState } from "react";
import { fetchProfiles, saveUser } from "services/DiscoClubService";
import { Role } from "interfaces/Role";

const { Option } = Select;
const prefixSelector = (
  <Form.Item name="prefix" noStyle>
    <Select defaultValue="353" style={{ width: 80 }}>
      <Option value="353">+353</Option>
      <Option value="55">+55</Option>
      <Option value="86">+86</Option>
      <Option value="87">+87</Option>
    </Select>
  </Form.Item>
);

const UserDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const initial: any = location.state;
  const [form] = Form.useForm();

  useEffect(() => {
    let mounted = true;
    async function getRoles() {
      const response: any = await fetchProfiles();
      if (mounted) {
        setRoles(response.results);
        setLoading(false);
      }
    }
    setLoading(true);
    getRoles();
    return () => {
      mounted = false;
    };
  }, []);
  const onFinish = async () => {
    setLoading(true);
    try {
      const user = form.getFieldsValue(true);
      await saveUser(user);
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/users");
    } catch (error) {
      setLoading(false);
    }
  };
  return (
    <>
      <PageHeader title="User Update" subTitle="User" />
      <Form
        name="userForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}>
        <Row gutter={8}>
          <Col lg={8} xs={24}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Email" name="user">
              <Input type="email" />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Password" name="pwd">
              <Input.Password />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item name="profile" label="Profile">
              <Select>
                {roles.map((role) => (
                  <Select.Option key={role.id} value={role.name}>
                    {role.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Phone" name="phone">
              <Input addonBefore={prefixSelector} />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={4} xs={24}>
            <Form.Item label="Dollars" name="discoDollars">
              <InputNumber />
            </Form.Item>
          </Col>
          <Col lg={4} xs={24}>
            <Form.Item label="Gold" name="discoGold">
              <InputNumber />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/users")}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default UserDetail;
