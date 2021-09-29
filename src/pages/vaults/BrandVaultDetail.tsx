import { Button, Col, Form, Input, PageHeader, Row } from "antd";
import { useRequest } from "../../hooks/useRequest";
import { useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { saveBrandVault, fetchBrands } from "../../services/DiscoClubService";
import { SelectBrand } from "components/SelectBrand";
import { Brand } from "interfaces/Brand";

const BrandVaultDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const vaultTemplate = form.getFieldsValue(true);
    await doRequest(() => saveBrandVault(vaultTemplate));
    history.goBack();
  };

  return (
    <>
      <PageHeader title="Brand Vault" subTitle="Brand Vault Template " />
      <Form
        name="brandVaultForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item label="Key" name="key" rules={[{ required: true }]}>
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
                label="API Shop Name"
                name="apiShopName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Token"
                name="token"
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
