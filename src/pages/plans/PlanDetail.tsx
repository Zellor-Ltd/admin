/* eslint-disable react-hooks/exhaustive-deps */
import {
  Button,
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
import { useContext, useRef } from 'react';
import React from 'react';
import { TwitterPicker } from 'react-color';
import scrollIntoView from 'scroll-into-view';
import { useSelector } from 'react-redux';
import { Plan } from 'interfaces/Plan';
import { updatePlan } from 'services/AdminService';
import { AppContext } from 'contexts/AppContext';
interface PlanDetailProps {
  onSave?: (record: Plan) => void;
  onCancel?: () => void;
  plan?: Plan;
}

const PlanDetail: React.FC<PlanDetailProps> = ({ plan, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const toFocus = useRef<any>();
  const { isMobile } = useContext(AppContext);

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
      const planForm = form.getFieldsValue(true);
      if (planForm.importStrategy) planForm.importStartegy = 'variants';
      else planForm.importStartegy = 'unique';

      const response: any = await updatePlan(planForm);

      message.success('Register updated with success.');
      planForm.id
        ? onSave?.(planForm)
        : onSave?.({ ...planForm, id: response.id });
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  return (
    <>
      <PageHeader title={plan ? 'Plan Update' : 'New Plan'} />
      <Form.Provider>
        <Form
          name="planForm"
          layout="vertical"
          form={form}
          initialValues={plan}
          style={
            isMobile
              ? { position: 'relative', right: '.625rem', top: '.5rem' }
              : { marginLeft: '1.5rem' }
          }
          onFinish={onFinish}
          onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        >
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Col span={24}>
                <Form.Item label="Plan Name" name="name">
                  <Input allowClear placeholder="Plan Name" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="users" label="Users">
                  <InputNumber min={0} placeholder="Select a number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="priceMonthly" label="Price (Monthly)">
                  <InputNumber min={0} placeholder="Select a number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="priceYearly" label="Price (Yearly)">
                  <InputNumber min={0} placeholder="Select a number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="videoUploads" label="Max Videos">
                  <InputNumber min={0} placeholder="Select a number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="videoPlaysMonth" label="Max Video Plays/month">
                  <InputNumber min={0} placeholder="Select a number" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="showWatermark"
                  label="Show Watermark"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Col>
          </Row>
          <Row
            gutter={8}
            justify="end"
            style={{
              position: isMobile ? 'fixed' : 'absolute',
              bottom: '1rem',
              right: '2rem',
            }}
          >
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

export default PlanDetail;
