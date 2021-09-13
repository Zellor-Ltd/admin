import { Button, Col, Form, Input, message, PageHeader, Row } from "antd";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { saveOrder } from "services/DiscoClubService";

const OrderDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    settings: { order: ordersSettings = [] },
  } = useSelector((state: any) => state.settings);

  const onFinish = async () => {
    setLoading(true);
    try {
      const order = form.getFieldsValue(true);
      await saveOrder(order);
      setLoading(false);
      message.success("Register updated with success.");
      history.push("/orders");
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Order Update" subTitle="Order" />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initial}
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
            <Button type="default" onClick={() => history.push("/orders")}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button loading={loading} type="primary" onClick={onFinish}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default OrderDetail;
