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
  Select,
  Tabs,
  Typography,
} from 'antd';
import { Upload } from 'components';
import { useRequest } from '../../hooks/useRequest';
import React, { useRef, useState } from 'react';
import { saveProductBrand } from '../../services/DiscoClubService';
import { TwitterPicker } from 'react-color';
import { ProductBrand } from 'interfaces/ProductBrand';
import { Brand } from 'interfaces/Brand';
import scrollIntoView from 'scroll-into-view';
import {
  InstagramFilled,
  FacebookFilled,
  SoundFilled,
  YoutubeFilled,
  GlobalOutlined,
  TwitterCircleFilled,
} from '@ant-design/icons';
interface ProductBrandDetailProps {
  productBrand: ProductBrand | undefined;
  onSave?: (record: ProductBrand) => void;
  onCancel?: () => void;
  brands: Brand[];
}

const ProductBrandsDetail: React.FC<ProductBrandDetailProps> = ({
  productBrand,
  onSave,
  onCancel,
  brands,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });
  const [activeTabKey, setActiveTabKey] = React.useState('Details');
  const toFocus = useRef<any>();
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
      message.error('Error: ' + err.error);
    }
  };

  const handleTabChange = (activeKey: string) => {
    setActiveTabKey(activeKey);
  };

  const checkConstraintValidity = () => {
    const discoPercentage = document.getElementById('discoPercentage') as any;
    const creatorPercentage = document.getElementById(
      'creatorPercentage'
    ) as any;
    const maxDiscoDollarPercentage = document.getElementById(
      'maxDiscoDollarPercentage'
    ) as any;
    const elements = [
      discoPercentage,
      creatorPercentage,
      maxDiscoDollarPercentage,
    ];
    toFocus.current = elements.find(item => !item?.checkValidity());
    if (toFocus.current) {
      setActiveTabKey('Details');
      scrollIntoView(toFocus.current);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);

    if (!toFocus.current) {
      const id = errorFields[0].name[0];
      const element = document.getElementById(id);

      switch (id) {
        case 'discoPercentage':
        case 'creatorPercentage':
        case 'maxDiscoDollarPercentage':
        case 'brandName':
        case 'masterBrand':
        case 'brandTxtColor':
          setActiveTabKey('Details');
          break;
        case 'brandLogo':
        case 'mastHead':
        case 'avatar':
          setActiveTabKey('Images');
          break;
        default:
          console.log('Something went wrong.');
      }
      scrollIntoView(element);
    }
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
            ? `${productBrand.brandName ?? ''} Update`
            : 'New Product Brand'
        }
      />
      <Form
        name="productBrandForm"
        layout="vertical"
        form={form}
        initialValues={productBrand}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
      >
        <>
          <Tabs
            defaultActiveKey="Details"
            activeKey={activeTabKey}
            onChange={handleTabChange}
          >
            <Tabs.TabPane forceRender tab="Details" key="Details">
              <Col lg={12} xs={24}>
                <Row gutter={8}>
                  <Col lg={12} xs={24}>
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
                      <Input id="brandName" />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item label="External Code" name="externalCode">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Description" name="description">
                      <Input.TextArea
                        rows={2}
                        placeholder="Description"
                        allowClear
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item label="Home URL" name="homeUrl">
                      <Input placeholder="Home URL" allowClear />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="apiBrand" label="API Brand">
                      <Input placeholder="API Brand" />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="masterBrand"
                      label="Master Brand"
                      rules={[
                        {
                          required: true,
                          message: 'Master Brand is required.',
                        },
                      ]}
                    >
                      <Select
                        id="masterBrand"
                        placeholder="Select a Master Brand"
                        style={{ width: '100%' }}
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          !!option?.children
                            ?.toString()
                            ?.toUpperCase()
                            .includes(input?.toUpperCase())
                        }
                      >
                        {brands.map((curr: any) => (
                          <Select.Option key={curr.id} value={curr.id}>
                            {curr.brandName}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
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
                        id="discoPercentage"
                        pattern="^((1[0-9][0-9])|([0-9]{1,2}))$"
                        title="Positive integers."
                      />
                    </Form.Item>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item name="creatorPercentage" label="Creator %">
                      <InputNumber
                        id="creatorPercentage"
                        pattern="^((1[0-9][0-9])|([0-9]{1,2}))$"
                        title="Positive integers."
                        onChange={input =>
                          handleCreatorPercentageChange(input as number)
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
                        Would you like to apply this creator percentage to all{' '}
                        {productBrand?.brandName} products?
                      </p>
                    </Modal>
                  </Col>
                  <Col lg={12} xs={24}>
                    <Form.Item
                      name="maxDiscoDollarPercentage"
                      label="Max Disco Dollar %"
                      rules={[
                        {
                          required: true,
                          message: 'Max Disco Dollar percentage is required.',
                        },
                      ]}
                    >
                      <InputNumber
                        id="maxDiscoDollarPercentage"
                        pattern="^((1[0-9][0-9])|([0-9]{1,2}))$"
                        title="Positive integers."
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
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
                      <ColorPicker id="brandTxtColor" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Tabs.TabPane>
            <Tabs.TabPane forceRender tab="Social" key="Social">
              <Row gutter={8}>
                <Col lg={24} xs={24}>
                  <Typography.Title level={4}>Social Channels</Typography.Title>
                </Col>
              </Row>
              <Row>
                <Col lg={8} xs={24}>
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
            </Tabs.TabPane>
            <Tabs.TabPane forceRender tab="Images" key="Images">
              <Col lg={16} xs={24}>
                <Row gutter={8}>
                  <Col lg={6} xs={12}>
                    <Form.Item label="Colour">
                      <Upload.ImageUpload
                        type="colourLogo"
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
                        type="blackLogo"
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
                        type="whiteLogo"
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
                        id="brandLogo"
                        type="brandLogo"
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
                    <Form.Item label="Thumbnail" name="thumbnail">
                      <Upload.ImageUpload
                        type="thumbnail"
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
                    >
                      <Upload.ImageUpload
                        type="videoLogo"
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
                        id="mastHead"
                        type="masthead"
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
                        id="avatar"
                        type="avatar"
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
          <Row gutter={8} justify="end">
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
                onClick={checkConstraintValidity}
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
