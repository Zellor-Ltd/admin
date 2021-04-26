import { Button, Col, Form, Input, message, PageHeader, Row } from "antd";
import { Upload } from "components";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { saveCategory } from "services/DiscoClubService";

const CategoryDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const brand = form.getFieldsValue(true);
      const response: any = await saveCategory(brand);
      if (response.success) {
        message.success("Register updated with success.");
        history.push("/categories");
      } else {
        message.error(response.error);
      }
    } catch (error) {
      message.error(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <PageHeader title="Category Update" subTitle="Category" />
      <Form
        name="categoryForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}>
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Image">
              <Upload.ImageUpload
                maxCount={1}
                fileList={initial?.image}
                form={form}
                formProp="image"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/categories")}>
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

export default CategoryDetail;
