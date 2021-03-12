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

const CreatorDetail: React.FC = () => {
  const [form] = Form.useForm();
  return (
    <>
      <PageHeader title="Creator Update" subTitle="Creator" />
      <Form form={form} layout="vertical">
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
      </Form>
    </>
  );
};

export default CreatorDetail;
