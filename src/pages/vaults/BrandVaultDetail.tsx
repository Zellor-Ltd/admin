import { Button, Col, Form, Input, PageHeader, Row } from "antd";
import { useRequest } from "../../hooks/useRequest";
import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { saveBrandVault } from "../../services/DiscoClubService";

const BrandVaultDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const brandVault = form.getFieldsValue(true);
    await doRequest(() => saveBrandVault(brandVault));
    history.goBack();
  };

  return (
    <>
      <Form
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Shop Name"
                name="shopName"
                rules={[{ required: true }]}
              >
                <Input />
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

export default BrandVaultDetail;
