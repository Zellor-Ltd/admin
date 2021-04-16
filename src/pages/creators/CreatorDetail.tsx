import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Select,
  Slider,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { saveCreator } from "services/DiscoClubService";
import {
  InstagramFilled,
  FacebookFilled,
  YoutubeFilled,
  TwitterCircleFilled,
  GlobalOutlined,
  SoundFilled,
} from "@ant-design/icons";
import { Upload } from "components";

const CreatorDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState(false);
  const [ageRange, setageRange] = useState<[number, number]>([12, 100]);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const creator = form.getFieldsValue(true);
      await saveCreator(creator);
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/creators");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial?.ageMin && initial?.ageMax)
      setageRange([initial?.ageMin, initial?.ageMax]);
  }, [initial]);

  const onChangeAge = (value: [number, number]) => {
    form.setFieldsValue({
      ageMin: value[0],
      ageMax: value[1],
    });

    setageRange(value);
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
          <Col lg={6} xs={24}>
            <Form.Item label="First Name" name="firstName">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Last name" name="lastName">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Email" name="email" rules={[{ type: "email" }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Phone" name="phone">
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
            <Typography.Title level={4}>Target</Typography.Title>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Slider">
              <Slider
                range
                marks={{ 12: "12", 100: "100" }}
                min={12}
                max={100}
                value={ageRange}
                onChange={onChangeAge}
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item name="gender" label="Gender">
              <Select mode="multiple">
                <Select.Option value="Female">Female</Select.Option>
                <Select.Option value="Male">Male</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
                <Select.Option value="Prefer not to say">
                  Prefer not to say
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col lg={24} xs={24}>
            <Form.Item label="Image">
              <Upload.ImageUpload
                fileList={initial?.image}
                formProp="image"
                form={form}
              />
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
            <Form.Item name="instagram" label="Instagram">
              <Input prefix={<InstagramFilled />} />
            </Form.Item>
            <Form.Item name="facebook" label="Facebook">
              <Input prefix={<FacebookFilled />} />
            </Form.Item>
            <Form.Item name="tiktok" label="TikTok">
              <Input prefix={<SoundFilled />} />
            </Form.Item>
            <Form.Item name="youtube" label="Youtube">
              <Input prefix={<YoutubeFilled />} />
            </Form.Item>
            <Form.Item name="website" label="Website">
              <Input prefix={<GlobalOutlined />} />
            </Form.Item>
            <Form.Item name="twitter" label="Twitter">
              <Input prefix={<TwitterCircleFilled />} />
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
