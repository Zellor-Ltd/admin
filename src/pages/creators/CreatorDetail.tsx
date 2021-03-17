import {
  Button,
  Col,
  Form,
  Input,
  PageHeader,
  Row,
  Select,
  Typography,
} from "antd";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { saveCreator } from "services/DiscoClubService";

const CreatorDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = () => {
    setLoading(true);
    try {
      saveCreator(form.getFieldsValue(true));
      setLoading(false);
      history.push("/creators");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Creator Update" subTitle="Creator" />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initial}>
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item label="First Name" name="firstName">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Last name" name="lastName">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Email" name="email" rules={[{ type: "email" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Phone" name="phone">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={8} xs={24}>
            <Form.Item label="Website" name="website">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item label="Describe your content focus" name="contentFocus">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col lg={24} xs={24}>
            <Form.Item
              label="Top Brand collaborations you have completed"
              name="topBrands">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col lg={24} xs={24}>
            <Typography.Title level={4}>Social Channels</Typography.Title>
          </Col>
        </Row>
        <Row>
          <Col lg={8} xs={24} md={24}>
            <Form.Item>
              <Button>Add Social Media</Button>
              <Select allowClear>
                <Select.Option value="Instagram">Instagram</Select.Option>
                <Select.Option value="TikTok">TikTok</Select.Option>
                <Select.Option value="Linkedin">Linkedin</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/creators")}>
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

export default CreatorDetail;
