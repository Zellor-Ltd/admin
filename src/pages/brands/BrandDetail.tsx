import { useEffect, useState } from "react";
import { Button, Col, Form, Input, message, PageHeader, Row } from "antd";
import { RouteComponentProps } from "react-router";
import { TwitterPicker } from "react-color";
import { saveBrand } from "services/DiscoClubService";
import { Upload } from "components";

const BrandDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState<any>([]);
  const [brandCardUrl, setBrandCardUrl] = useState<any>([]);

  useEffect(() => {
    if (initial) {
      setLogoUrl([
        {
          url: initial.brandLogoUrl,
        },
      ]);
      setBrandCardUrl([
        {
          url: initial.brandCardUrl,
        },
      ]);
    }
  }, [initial]);

  const onFinish = async () => {
    setLoading(true);
    try {
      const brand = form.getFieldsValue(true);
      await saveBrand(form.getFieldsValue(true));
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/brands");
    } catch (error) {
      setLoading(false);
    }
  };

  const onChangeLogoUrl = (info: any) => {
    setLogoUrl(info.fileList);
    if (info.file.status === "done") {
      const response = JSON.parse(info.file.xhr.response);
      form.setFieldsValue({ brandLogoUrl: response.result.replace(";", "") });
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const onChangeBrandCardUrl = (info: any) => {
    setBrandCardUrl(info.fileList);
    if (info.file.status === "done") {
      const response = JSON.parse(info.file.xhr.response);
      form.setFieldsValue({ brandCardUrl: response.result.replace(";", "") });
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
            <Form.Item label="Brand Logo URL">
              <Upload.ImageUpload
                onChange={onChangeLogoUrl}
                fileList={logoUrl}
                maxCount={1}
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Brand Card URL" name="brandCardUrl">
              <Upload.ImageUpload
                maxCount={1}
                onChange={onChangeBrandCardUrl}
                fileList={brandCardUrl}
              />
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
