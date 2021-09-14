import { Button, Col, DatePicker, Form, PageHeader, Row } from "antd";
import { RichTextEditor } from "components/RichTextEditor";
import { formatMoment } from "helpers/formatMoment";
import { useRequest } from "hooks/useRequest";
import { useState } from "react";
import { RouteComponentProps } from "react-router";
import { savePromoDisplay } from "services/DiscoClubService";

const PromoDisplaysDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const promoDisplay = form.getFieldsValue(true);
    await doRequest(() => savePromoDisplay(promoDisplay));
    history.push("/promo-displays");
  };

  return (
    <>
      <PageHeader title="Shop Display Update" subTitle="Shop Display " />
      <Form
        name="promoDisplayForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row>
          <Col lg={24} xs={24}>
            <Form.Item label="Display HTML">
              <RichTextEditor
                formField="displayHtml"
                form={form}
                editableHtml={true}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col lg={6} xs={24}>
            <Form.Item
              name="displayStartDate"
              label="Display Start Date"
              getValueProps={formatMoment}
              rules={[{ required: true }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item
              name="displayExpireDate"
              label="Display Expire Date"
              getValueProps={formatMoment}
              rules={[{ required: true }]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button
              type="default"
              onClick={() => history.push("/promo-displays")}
            >
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

export default PromoDisplaysDetail;
