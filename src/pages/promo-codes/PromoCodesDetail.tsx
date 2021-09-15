import { Button, Col, Form, Input, message, PageHeader, Row } from "antd";
import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { savePromoCode } from "services/DiscoClubService";

const PromoCodesDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const promoCode = form.getFieldsValue(true);
      await savePromoCode(promoCode);
      setLoading(false);
      message.success("Register updated with success.");
      history.goBack();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Promo Code Update" subTitle="Promo Code" />
      <Form
        name="promoCodeForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Promo Code"
                name="code"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Shop Name"
                name="shopName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Discount"
                name="discount"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Disco Dollars"
                name="dollars"
                rules={[{ required: true }]}
              >
                <Input type="number" />
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
            <Button loading={loading} type="primary" onClick={onFinish}>
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default PromoCodesDetail;
