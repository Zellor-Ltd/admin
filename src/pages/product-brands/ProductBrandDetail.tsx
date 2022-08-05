import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  PageHeader,
  Row,
  Tabs,
  Typography,
} from 'antd';
import { Upload } from 'components';
import { useRequest } from '../../hooks/useRequest';
import React, { useState, useContext } from 'react';
import { AppContext } from 'contexts/AppContext';
import { saveProductBrand } from '../../services/DiscoClubService';
import { TwitterPicker } from 'react-color';
import { ProductBrand } from 'interfaces/ProductBrand';
interface ProductBrandDetailProps {
  productBrand: ProductBrand | undefined;
  onSave?: (record: ProductBrand) => void;
  onCancel?: () => void;
}

const ProductBrandsDetail: React.FC<ProductBrandDetailProps> = ({
  productBrand,
  onSave,
  onCancel,
}) => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const [activeTabKey, setActiveTabKey] = React.useState('Details');
  const [showModal, setShowModal] = useState<boolean>(false);

  const onFinish = async () => {
    try {
      const formProductBrand = form.getFieldsValue(true);
      const { result } = await doRequest(() =>
        saveProductBrand(formProductBrand)
      );
      formProductBrand.id
        ? onSave?.(formProductBrand)
        : onSave?.({ ...formProductBrand, id: result });
    } catch (err: any) {
      console.log(err);
      message.error(err.error);
    }
  };

  const changeTab = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  const onConfirmPropagate = () => {
    form.setFieldsValue({ propagationNeeded: true });
    setShowModal(false);
  };

  const onCancelPropagate = () => {
    form.setFieldsValue({ propagationNeeded: false });
    setShowModal(false);
  };

  const handleCreatorPercentageChange = (input: number) => {
    form.setFieldsValue({ creatorPercentage: input });
    setShowModal(true);
  };

  return (
    <>
      <PageHeader
        title={
          productBrand
            ? `${productBrand.brandName} Update`
            : 'New Product Brand'
        }
      />
      <Form
        name="productBrandForm"
        layout="vertical"
        form={form}
        initialValues={productBrand}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => {
          errorFields.forEach(errorField => {
            message.error(errorField.errors[0]);
          });
        }}
      >
        <>
          <Tabs
            defaultActiveKey="Details"
            activeKey={activeTabKey}
            onChange={changeTab}
          >
            <Tabs.TabPane forceRender tab="Details" key="Details">
              <Row gutter={8}>
                <Col lg={12} xs={24}>
                  <Col lg={16} xs={24}>
                    <Form.Item
                      label="Product Brand Name"
                      name="brandName"
                      rules={[
                        {
                          required: true,
                          message: 'Product Brand Name is required.',
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col lg={16} xs={24}>
                    <Form.Item label="External Code" name="externalCode">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col>
                    <Row gutter={4}>
                      <Col lg={8} xs={24}>
                        <Form.Item
                          name="discoPercentage"
                          label="Disco Percentage %"
                          rules={[
                            {
                              required: true,
                              message: 'Disco Percentage is required.',
                            },
                          ]}
                        >
                          <InputNumber
                            pattern="^(?:100|\d{1,2})(?:.\d{1,2})?$"
                            title="positive integers"
                            min={0}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                      <Col lg={8} xs={24}>
                        <Form.Item name="creatorPercentage" label="Creator %">
                          <InputNumber
                            pattern="^(?:100|\d{1,2})(?:.\d{1,2})?$"
                            title="positive integers"
                            min={0}
                            max={100}
                            onChange={input =>
                              handleCreatorPercentageChange(input)
                            }
                          />
                        </Form.Item>
                        <Modal
                          title="Apply to all products?"
                          visible={showModal}
                          onOk={onConfirmPropagate}
                          onCancel={onCancelPropagate}
                          okText="Yes"
                          cancelText="No"
                        >
                          <p>
                            Would you like to apply this creator percentage to
                            all {productBrand?.brandName} products?
                          </p>
                        </Modal>
                      </Col>
                    </Row>
                    <Row gutter={4}>
                      <Col lg={8} xs={24}>
                        <Form.Item
                          name="maxDiscoDollarPercentage"
                          label="Max Disco Dollar %"
                          rules={[
                            {
                              required: true,
                              message:
                                'Max Disco Dollar percentage is required.',
                            },
                          ]}
                        >
                          <InputNumber
                            pattern="^(?:100|\d{1,2})(?:.\d{1,2})?$"
                            title="positive integers"
                            min={0}
                            max={100}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                  <Col lg={24} xs={24}>
                    <Form.Item
                      label="Product Brand Color"
                      name="brandTxtColor"
                      rules={[
                        {
                          required: true,
                          message: 'Product Brand Color is required.',
                        },
                      ]}
                      valuePropName="color"
                    >
                      <ColorPicker />
                    </Form.Item>
                  </Col>
                </Col>
              </Row>
            </Tabs.TabPane>

            <Tabs.TabPane forceRender tab="Images" key="Images">
              <Col lg={16} xs={24}>
                <Row gutter={8}>
                  <Col lg={6} xs={12}>
                    <Form.Item label="Colour">
                      <Upload.ImageUpload
                        maxCount={1}
                        fileList={productBrand?.colourLogo}
                        form={form}
                        formProp="colourLogo"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={12}>
                    <Form.Item label="Black">
                      <Upload.ImageUpload
                        maxCount={1}
                        fileList={productBrand?.blackLogo}
                        form={form}
                        formProp="blackLogo"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={12}>
                    <Form.Item label="White">
                      <Upload.ImageUpload
                        maxCount={1}
                        fileList={productBrand?.whiteLogo}
                        form={form}
                        formProp="whiteLogo"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={12}>
                    <Form.Item
                      label="Logo Round"
                      rules={[
                        { required: true, message: 'Logo Round is required.' },
                      ]}
                      name="brandLogo"
                    >
                      <Upload.ImageUpload
                        fileList={productBrand?.brandLogo}
                        maxCount={1}
                        form={form}
                        formProp="brandLogo"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col lg={6} xs={12}>
                    <Form.Item
                      label="Thumbnail"
                      name="thumbnail"
                      rules={[{ required: false }]}
                    >
                      <Upload.ImageUpload
                        maxCount={1}
                        fileList={productBrand?.thumbnail}
                        form={form}
                        formProp="thumbnail"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={12}>
                    <Form.Item
                      label="Product Brand Video Logo"
                      name="videoLogo"
                      rules={[{ required: false }]}
                    >
                      <Upload.ImageUpload
                        maxCount={1}
                        fileList={productBrand?.videoLogo}
                        form={form}
                        formProp="videoLogo"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Typography.Title style={{ marginBottom: '4vh' }} level={5}>
                  Brand Page Display
                </Typography.Title>
                <Row gutter={8}>
                  <Col lg={6} xs={12}>
                    <Form.Item
                      label="Masthead Image"
                      name="mastHead"
                      rules={[
                        {
                          required: true,
                          message: 'Masthead Image is required.',
                        },
                      ]}
                    >
                      <Upload.ImageUpload
                        maxCount={1}
                        fileList={productBrand?.mastHead}
                        form={form}
                        formProp="mastHead"
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={6} xs={12}>
                    <Form.Item
                      label="Avatar"
                      name="avatar"
                      rules={[
                        { required: true, message: 'Avatar is required.' },
                      ]}
                    >
                      <Upload.ImageUpload
                        maxCount={1}
                        fileList={productBrand?.avatar}
                        form={form}
                        formProp="avatar"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Tabs.TabPane>
          </Tabs>
          <Row gutter={8} justify={isMobile ? 'end' : undefined}>
            <Col>
              <Button
                type="default"
                onClick={() => onCancel?.()}
                className="mb-1"
              >
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                className="mb-1"
              >
                Save Changes
              </Button>
            </Col>
          </Row>
        </>
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
