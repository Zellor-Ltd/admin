/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
  Select,
  Switch,
} from 'antd';
import { Upload } from 'components';
import { useContext, useRef } from 'react';
import React from 'react';
import { TwitterPicker } from 'react-color';
import scrollIntoView from 'scroll-into-view';
import { AppContext } from 'contexts/AppContext';
import { useSelector } from 'react-redux';
import { Client } from 'interfaces/Client';
import { updateClient } from 'services/AdminService';
interface ClientDetailProps {
  onSave?: (record: Client) => void;
  onCancel?: () => void;
  client?: Client;
}

const ClientDetail: React.FC<ClientDetailProps> = ({
  client,
  onSave,
  onCancel,
}) => {
  const { isMobile } = useContext(AppContext);
  const [form] = Form.useForm();
  const toFocus = useRef<any>();
  const {
    settings: { plan = [] },
  } = useSelector((state: any) => state.settings);

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
      const clientForm = form.getFieldsValue(true);
      if (clientForm.importStrategy) clientForm.importStartegy = 'variants';
      else clientForm.importStartegy = 'unique';

      const response: any = await updateClient(clientForm);

      message.success('Register updated with success.');
      clientForm.id
        ? onSave?.(clientForm)
        : onSave?.({ ...clientForm, id: response.id });
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  return (
    <>
      <PageHeader
        title={client ? `${client.name ?? ''} Update` : 'New Client'}
      />
      <Form.Provider>
        <Form
          name="clientForm"
          layout="vertical"
          form={form}
          initialValues={{
            ...client,
            limitOfVideos: client?.limitOfVideos ?? 20,
          }}
          onFinish={onFinish}
          onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        >
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Row gutter={8}>
                {typeof client?.isShopifyCustomer !== 'undefined' && (
                  <>
                    <Col span={12}>
                      <Form.Item label="Client Name" name="name">
                        <Input allowClear placeholder="Client Name" />
                      </Form.Item>
                    </Col>
                    <Col span={12} className="mt-19">
                      <Form.Item>
                        <Input
                          disabled
                          value={
                            client?.isShopifyCustomer
                              ? 'Shopify'
                              : 'Not Shopify'
                          }
                        />
                      </Form.Item>
                    </Col>
                  </>
                )}
                {typeof client?.isShopifyCustomer === 'undefined' && (
                  <>
                    <Col span={24}>
                      <Form.Item label="Client Name" name="name">
                        <Input allowClear placeholder="Client Name" />
                      </Form.Item>
                    </Col>
                  </>
                )}
                {/* 
                <Col span={24}>
                  <Form.Item label="E-mail" name="email">
                    <Input allowClear placeholder="E-mail" />
                  </Form.Item>
                </Col> */}
                {/* 
                <Col span={24}>
                  <div className="ant-form-item">
                    <p>Store Details</p>
                    <Card
                      style={{
                        width: '100%',
                        borderRadius: '5px',
                        background: '#d3d3d32e',
                      }}
                    >
                      <Form.Item label="First Name" name="marketingFirstName">
                        <Input allowClear placeholder="First Name" />
                      </Form.Item>
                      <Form.Item label="Surname" name="marketingSurname">
                        <Input allowClear placeholder="Surame" />
                      </Form.Item>
                      <Form.Item label="Email Address" name="marketingEmail">
                        <Input allowClear placeholder="Email Address" />
                      </Form.Item>
                    </Card>
                  </div>
                </Col> */}
                <Col span={24}>
                  <Form.Item label="Plan" name="plan" shouldUpdate>
                    <Select
                      placeholder="Select a Plan"
                      allowClear
                      showSearch
                      filterOption={(input: string, option: any) => {
                        return option?.label
                          ?.toUpperCase()
                          .includes(input?.toUpperCase());
                      }}
                    >
                      {plan.map(planType => (
                        <Select.Option
                          key={planType.value}
                          value={planType.value}
                          label={planType.name}
                        >
                          {planType.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Col span={24}>
                <Form.Item
                  name="videoUploads"
                  label="Max Videos"
                  /* rules={[
                    {
                      required: true,
                      message: 'Max Videos is required.',
                    },
                  ]} */
                >
                  <InputNumber min={0} disabled placeholder="Select a number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="videoPlaysMonth"
                  label="Max Video Plays/month"
                  /* rules={[
                    {
                      required: true,
                      message: 'Max Video Plays/month is required.',
                    },
                  ]} */
                >
                  <InputNumber min={0} disabled placeholder="Select a number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="showImportTab"
                  label="Show Import tab"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Currency" name="currencyCode" shouldUpdate>
                  <Select
                    placeholder="Select a Currency"
                    allowClear
                    showSearch
                    filterOption={(input: string, option: any) => {
                      return option?.label
                        ?.toUpperCase()
                        .includes(input?.toUpperCase());
                    }}
                  >
                    <Select.Option key="USD" value="USD" label="USD">
                      USD
                    </Select.Option>

                    <Select.Option key="EUR" value="EUR" label="EUR">
                      EUR
                    </Select.Option>

                    <Select.Option key="GBP" value="GBP" label="GBP">
                      GBP
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="importStrategy"
                  label="Import Variants"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="shopifyShopUrl"
                  label="Shop URL (Template $DISCOID$)"
                >
                  <Input
                    allowClear
                    id="shopifyShopUrl"
                    placeholder="Shop URL"
                  />
                </Form.Item>
              </Col>
            </Col>
          </Row>
          <Row gutter={8} justify="end">
            <Col>
              <Button type="default" onClick={() => onCancel?.()}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit" className="mb-1">
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      </Form.Provider>
    </>
  );
};

export default ClientDetail;

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
