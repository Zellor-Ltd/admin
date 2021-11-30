import { Button, Col, Form, Input, PageHeader, Row } from "antd";
import { Upload } from "components";
import { useRequest } from "../../hooks/useRequest";
import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { saveProductBrand } from "../../services/DiscoClubService";

const ProductBrandsDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const productBrand = form.getFieldsValue(true);
    await doRequest(() => saveProductBrand(productBrand));
    history.goBack();
  };

  return (
    <>
      <PageHeader
        title="Product Brand Update"
        subTitle="Product Brand Template"
      />
      <Form
        name="productBrandForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Product Brand Name"
                name="brandName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Form.Item
                label="Brand Logo"
                name="brandLogo"
                rules={[{ required: false }]}
              >
                <Upload.ImageUpload
                  maxCount={1}
                  fileList={initial?.brandLogo}
                  form={form}
                  formProp="brandLogo"
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
            <Col lg={12} xs={24}>
              <Form.Item
                label="Product Brand Video Logo"
                name="videoLogo"
                rules={[{ required: false }]}
              >
                <Upload.ImageUpload
                  maxCount={1}
                  fileList={initial?.videoLogo}
                  form={form}
                  formProp="videoLogo"
                />
              </Form.Item>
            </Col>
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

export default ProductBrandsDetail;
