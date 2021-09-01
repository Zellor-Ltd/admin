import { useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Switch,
} from "antd";
import { RouteComponentProps } from "react-router";
import { TwitterPicker } from "react-color";
import { saveBrand } from "services/DiscoClubService";
import { Upload } from "components";
import { RichTextEditor } from "components/RichTextEditor";

const BrandDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const brand = form.getFieldsValue(true);
      await saveBrand(brand);
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/brands");
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Brand Update" subTitle="Brand" />
      <Form
        name="brandForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item label="Brand Name" name="brandName">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                name="confirmationUrl"
                label="External Payment Confirmation URL"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                name="cancelationUrl"
                label="External Payment Cancelation URL"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                name="shopName"
                label="Shop Name (without https:// or spaces)"
                rules={[{ required: true }]}
              >
                <Input placeholder="casey-temp.myshopify.com" />
              </Form.Item>
            </Col>
            <Col lg={24} xs={24}>
              <Form.Item label="Pre-Checkout Message (With Discount)">
                <RichTextEditor
                  formField="overlayHtmlWithDiscount"
                  form={form}
                />
              </Form.Item>
            </Col>
            <Col lg={24} xs={24}>
              <Form.Item label="Pre-Checkout Message (WithOUT Discount)">
                <RichTextEditor
                  formField="overlayHtmlWithoutDiscount"
                  form={form}
                />
              </Form.Item>
            </Col>
          </Col>

          <Col lg={12} xs={24}>
            <Row>
              <Col lg={6} xs={24}>
                <Form.Item label="Colour">
                  <Upload.ImageUpload
                    maxCount={1}
                    fileList={initial?.colourLogo}
                    form={form}
                    formProp="colourLogo"
                  />
                </Form.Item>
              </Col>
              <Col lg={6} xs={24}>
                <Form.Item label="Black">
                  <Upload.ImageUpload
                    maxCount={1}
                    fileList={initial?.blackLogo}
                    form={form}
                    formProp="blackLogo"
                  />
                </Form.Item>
              </Col>
              <Col lg={6} xs={24}>
                <Form.Item label="White">
                  <Upload.ImageUpload
                    maxCount={1}
                    fileList={initial?.whiteLogo}
                    form={form}
                    formProp="whiteLogo"
                  />
                </Form.Item>
              </Col>
              <Col lg={6} xs={24}>
                <Form.Item
                  label="Logo Round"
                  rules={[{ required: true }]}
                  name="brandLogo"
                >
                  <Upload.ImageUpload
                    fileList={initial?.brandLogo}
                    maxCount={1}
                    form={form}
                    formProp="brandLogo"
                  />
                </Form.Item>
              </Col>
              <Col lg={6} xs={24}>
                <Form.Item
                  label="Upload Card"
                  name="brandCard"
                  rules={[{ required: true }]}
                >
                  <Upload.ImageUpload
                    maxCount={1}
                    fileList={initial?.brandCard}
                    form={form}
                    formProp="brandCard"
                  />
                </Form.Item>
              </Col>
              <Col lg={6} xs={24}>
                <Form.Item
                  label="Thumbnail"
                  name="thumbnail"
                  rules={[{ required: false }]}
                >
                  <Upload.ImageUpload
                    maxCount={1}
                    fileList={initial?.thumbnail}
                    form={form}
                    formProp="thumbnail"
                  />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item
                  label="Brand Color"
                  name="brandTxtColor"
                  rules={[{ required: true }]}
                  valuePropName="color"
                >
                  <ColorPicker />
                </Form.Item>
              </Col>
              <Col lg={24} xs={24}>
                <Form.Item
                  name="automated"
                  label="Automated"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/brands")}>
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

export default BrandDetail;

const ColorPicker: React.FC<any> = (props) => {
  const { onChange } = props;
  return (
    <TwitterPicker onChangeComplete={(value: any) => onChange(value.hex)} />
  );
};
