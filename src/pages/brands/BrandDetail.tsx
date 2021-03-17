import { Button, Col, Form, Input, PageHeader, Row } from "antd";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { TwitterPicker } from "react-color";
import { saveBrand } from "services/DiscoClubService";

const BrandDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      await saveBrand(form.getFieldsValue(true));
      setLoading(false);
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
          <Col lg={24} xs={24}>
            <Form.Item label="Brand Logo URL" name="brandLogoUrl">
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
