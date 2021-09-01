import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Radio,
  Row,
} from "antd";
import { Endpoint } from "interfaces/Endpoint";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { saveEndpoint } from "services/DiscoClubService";

const EndpointDetail: React.FC<RouteComponentProps> = ({
  history,
  location,
}) => {
  const initial = location.state as Endpoint;
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (initial?.id) {
      form.setFieldsValue({ ...initial });
    } else {
      form.setFieldsValue({
        name: "",
        description: "",
        container: "",
        action: "Search",
        application: "Custom",
        isActive: false,
      });
    }
  }, [form, initial]);

  const onFinish = async () => {
    setLoading(true);
    try {
      const endpoint: Endpoint = form.getFieldsValue(true);

      await saveEndpoint(endpoint);
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/endpoints");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Endpoint Update" subTitle="Endpoint" />
      <Form
        name="endpointForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={6} xs={24}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Container" name="container">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Application" name="application">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col lg={12} xs={24}>
            <Form.Item name="action">
              <Radio.Group>
                <Radio value="Search">Search</Radio>
                <Radio value="Insert">Insert</Radio>
                <Radio value="Update">Update</Radio>
                <Radio value="Delete">Delete</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item name="isActive">
              <Checkbox disabled>isActive</Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/endpoints")}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" onClick={onFinish}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default EndpointDetail;
