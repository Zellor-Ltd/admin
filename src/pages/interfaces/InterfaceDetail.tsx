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
import { RouteComponentProps } from "react-router-dom";
import { saveInterface } from "services/DiscoClubService";

const InterfaceDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const endpoint: Function = form.getFieldsValue(true);

      await saveInterface(endpoint);
      setLoading(false);
      message.success("Register updated with success.");
      history.goBack();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Interface Update" subTitle="Interface" />
      <Form
        name="interfaceForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={6} xs={24}>
            <Form.Item label="Unique ID" name="uniqueId">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Source" name="source">
              <Input />
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
            <Button type="default" onClick={() => history.goBack()}>
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

export default InterfaceDetail;
