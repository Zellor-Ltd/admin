import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import { Order } from 'interfaces/Order';
import { useState } from 'react';
import { saveOrder } from 'services/DiscoClubService';
interface OrderDetailProps {
  order: Order | undefined;
  setDetails: any;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order, setDetails }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const order = form.getFieldsValue(true);
      await saveOrder(order);
      setLoading(false);
      message.success('Register updated with success.');
      setDetails(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={order ? `${order.firstName} Update` : 'New Item'}
        subTitle="Order"
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={order}
        autoComplete="off"
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item label="First Name" name="firstName">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Last name" name="lastName">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => setDetails(false)}>
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

export default OrderDetail;
