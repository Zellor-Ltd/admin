import { useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Row,
  Upload,
} from "antd";
import { RouteComponentProps } from "react-router";
import { TwitterPicker } from "react-color";
import { UploadOutlined } from "@ant-design/icons";
import { saveBrand } from "services/DiscoClubService";

const BrandDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const urlAction = `http://localhost:8010/proxy/Upload`;

  const onFinish = async () => {
    setLoading(true);
    try {
      await saveBrand(form.getFieldsValue(true));
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/brands");
    } catch (error) {
      setLoading(false);
    }
  };

  const onChangeBrandLogoUrl = (info: any) => {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
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
        onFinish={onFinish}>
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item label="Brand Name" name="brandName">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Brand Color" shouldUpdate>
              {({ getFieldValue, setFieldsValue }) => {
                return (
                  <TwitterPicker
                    color={getFieldValue("brandTxtColor")}
                    onChange={(value: any) =>
                      setFieldsValue({ brandTxtColor: value.hex })
                    }
                  />
                );
              }}
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Brand Logo URL" name="brandLogoUrl">
              <Upload
                action={urlAction}
                headers={{
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                }}
                onChange={onChangeBrandLogoUrl}>
                <Button icon={<UploadOutlined />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Brand Card URL" name="brandCardUrl">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/brands")}>
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

export default BrandDetail;
