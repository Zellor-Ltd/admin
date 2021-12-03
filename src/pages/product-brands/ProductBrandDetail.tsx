import { Button, Col, Form, Input, PageHeader, Row, Typography } from 'antd';
import { Upload } from 'components';
import { useRequest } from '../../hooks/useRequest';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { saveProductBrand } from '../../services/DiscoClubService';
import { TwitterPicker } from 'react-color';

const ProductBrandsDetail: React.FC<RouteComponentProps> = props => {
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
        title={`${initial.brandName} Update`}
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
            <Col lg={24} xs={24}>
              <Form.Item
                label="Product Brand Color"
                name="brandTxtColor"
                rules={[{ required: true }]}
                valuePropName="color"
              >
                <ColorPicker />
              </Form.Item>
            </Col>
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
            </Row>
            <Row>
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
            </Row>
            <Typography.Title style={{ marginBottom: '35px' }} level={5}>
              Store Page Display
            </Typography.Title>
            <Row>
              <Col lg={6} xs={24}>
                <Form.Item
                  label="Mast Head Image"
                  name="mastHead"
                  rules={[{ required: true }]}
                >
                  <Upload.ImageUpload
                    maxCount={1}
                    fileList={initial?.mastHead}
                    form={form}
                    formProp="mastHead"
                  />
                </Form.Item>
              </Col>
              <Col lg={6} xs={24}>
                <Form.Item
                  label="Avatar"
                  name="avatar"
                  rules={[{ required: true }]}
                >
                  <Upload.ImageUpload
                    maxCount={1}
                    fileList={initial?.avatar}
                    form={form}
                    formProp="avatar"
                  />
                </Form.Item>
              </Col>
            </Row>
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

const ColorPicker: React.FC<any> = props => {
  const { onChange } = props;
  return (
    <TwitterPicker onChangeComplete={(value: any) => onChange(value.hex)} />
  );
};
