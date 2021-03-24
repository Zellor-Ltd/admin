import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
} from "antd";
import { Function } from "interfaces/Function";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { saveEndpoint } from "services/DiscoClubService";

const EndpointDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const endpoint: Function = form.getFieldsValue(true);

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
        onFinish={onFinish}>
        <Row gutter={8}>
          <Col lg={6} xs={24}>
            <Form.Item label="Http Endpoint" name="httpEndpoint">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>

          <Col lg={6} xs={24}>
            <Form.Item label=" " name="verbs">
              <Checkbox.Group>
                <Checkbox value="GET" style={{ lineHeight: "32px" }}>
                  GET
                </Checkbox>
                <Checkbox value="POST" style={{ lineHeight: "32px" }}>
                  POST
                </Checkbox>
                <Checkbox value="PUT" style={{ lineHeight: "32px" }}>
                  PUT
                </Checkbox>
                <Checkbox value="DELETE" style={{ lineHeight: "32px" }}>
                  DELETE
                </Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label=" " name="active" valuePropName="checked">
              <Checkbox>Active?</Checkbox>
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
            <Button loading={loading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default EndpointDetail;
