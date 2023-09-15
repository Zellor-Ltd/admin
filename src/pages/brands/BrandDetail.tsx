/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import { Upload } from 'components';
import { Brand } from 'interfaces/Brand';
import { useContext, useRef } from 'react';
import React from 'react';
import { TwitterPicker } from 'react-color';
import { saveBrand } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
import { AppContext } from 'contexts/AppContext';
import DOMPurify from 'isomorphic-dompurify';
interface BrandDetailProps {
  onSave?: (record: Brand) => void;
  onCancel?: () => void;
  brand?: Brand;
}

const BrandDetail: React.FC<BrandDetailProps> = ({
  brand,
  onSave,
  onCancel,
}) => {
  const { isMobile } = useContext(AppContext);
  const [form] = Form.useForm();
  const toFocus = useRef<any>();

  const checkConstraintValidity = () => {
    const discoPercentage = document.getElementById('discoPercentage') as any;
    const creatorPercentage = document.getElementById(
      'creatorPercentage'
    ) as any;
    const maxDiscoDollarPercentage = document.getElementById(
      'maxDiscoDollarPercentage'
    ) as any;
    const initialFreeDdAmount = document.getElementById(
      'initialFreeDdAmount'
    ) as any;
    const returnPeriod = document.getElementById('returnPeriod') as any;
    const elements = [
      discoPercentage,
      creatorPercentage,
      maxDiscoDollarPercentage,
      initialFreeDdAmount,
      returnPeriod,
    ];
    toFocus.current = elements.find(item => !item?.checkValidity());
    if (toFocus.current) scrollIntoView(toFocus.current);
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);

    if (!toFocus.current) {
      const id = errorFields[0].name[0];
      const element = document.getElementById(id);
      scrollIntoView(element);
    }
  };

  const onFinish = async () => {
    try {
      const brandForm = form.getFieldsValue(true);
      if (brandForm.overlayHtmlWithoutDiscount)
        brandForm.overlayHtmlWithoutDiscount = DOMPurify.sanitize(
          brandForm.overlayHtmlWithoutDiscount
        );
      if (brandForm.overlayHtmlWithDiscount)
        brandForm.overlayHtmlWithDiscount = DOMPurify.sanitize(
          brandForm.overlayHtmlWithDiscount
        );

      const response: any = await saveBrand(brandForm);
      message.success('Register updated with success.');
      brandForm.id
        ? onSave?.(brandForm)
        : onSave?.({ ...brandForm, id: response.result });
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  return (
    <>
      <PageHeader title={brand ? `${brand.name ?? ''} Update` : 'New Client'} />
      <Form.Provider>
        <Form
          name="brandForm"
          layout="vertical"
          form={form}
          initialValues={brand}
          onFinish={onFinish}
          onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        >
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Row gutter={8}>
                <Col span={24}>
                  <Form.Item label="Client Name" name="name">
                    <Input allowClear placeholder="Client Name" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="E-mail" name="email">
                    <Input allowClear placeholder="E-mail" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label="Client Color"
                    name="txtColor"
                    rules={[
                      {
                        required: true,
                        message: 'Client Color is required.',
                      },
                    ]}
                  >
                    <ColorPicker id="txtColor" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Col span={24}>
                <Form.Item
                  name="shopUrl"
                  label="Shop URL (Template $DISCOID$)"
                  rules={[
                    {
                      required: true,
                      message: 'Shop URL is required.',
                    },
                  ]}
                >
                  <Input allowClear id="shopUrl" placeholder="Shop URL" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="shopName"
                  label="Shop Name (without https:// or spaces)"
                  rules={[
                    { required: true, message: 'Shop Name is required.' },
                  ]}
                >
                  <Input
                    allowClear
                    id="shopName"
                    placeholder="casey-temp.myshopify.com"
                  />
                </Form.Item>
              </Col>
            </Col>
          </Row>{' '}
          <Col lg={16} xs={24}>
            <Row
              gutter={8}
              justify={isMobile ? 'space-between' : undefined}
              className={isMobile ? 'mx-1 mb-n2' : 'mx-1'}
            >
              <Col lg={6}>
                <Form.Item
                  label="Logo"
                  rules={[{ required: true, message: 'Logo is required.' }]}
                  name="logo"
                >
                  <Upload.ImageUpload
                    id="logo"
                    type="logo"
                    onImageChange={() =>
                      form.setFieldsValue({ propagationNeeded: true })
                    }
                    fileList={brand?.logo}
                    maxCount={1}
                    form={form}
                    formProp="logo"
                  />
                </Form.Item>
              </Col>
              <Col lg={6}>
                <Form.Item label="White">
                  <Upload.ImageUpload
                    type="whiteLogo"
                    maxCount={1}
                    fileList={brand?.whiteLogo}
                    form={form}
                    formProp="whiteLogo"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Row gutter={8} justify="end">
            <Col>
              <Button type="default" onClick={() => onCancel?.()}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                className="mb-1"
                onClick={checkConstraintValidity}
              >
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      </Form.Provider>
    </>
  );
};

export default BrandDetail;

const ColorPicker: React.FC<any> = props => {
  const { onChange } = props;

  const _onChange = input => {
    onChange(input);
    for (let i = 2; i < 12; i += 2) {
      if (document.getElementById(`rc-editable-input-${i}`)) {
        var picker: any = document.getElementById(`rc-editable-input-${i}`);
        picker.value = input;
        break;
      }
    }
  };

  return (
    <TwitterPicker
      width="100%"
      onChangeComplete={(value: any) => _onChange(value.hex)}
    />
  );
};
