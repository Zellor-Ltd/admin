import { Button, Col, Form, Input, message, PageHeader, Row } from "antd";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { saveRole } from "services/DiscoClubService";

const RoleDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const [loading, setLoading] = useState(false);
  const initial: any = location.state;
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const role = form.getFieldsValue(true);
      await saveRole(role);
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/roles");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Role Update" subTitle="Role" />
      <Form
        name="roleForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={8} xs={24}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item label="Description" name="description">
              <Input.TextArea />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/roles")}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button type="primary" onClick={onFinish} loading={loading}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default RoleDetail;
