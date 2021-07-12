import { Button, Col, Form, Input, PageHeader, Row } from "antd";
import { RouteComponentProps } from "react-router";
import { savePromotion } from "services/DiscoClubService";
import { useSelector } from "react-redux";
import { RichTextEditor } from "components/RichTextEditor";
import { useRequest } from "hooks/useRequest";

const PromotionDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial: any = location.state;
  const [form] = Form.useForm();
  const { doRequest, loading } = useRequest({});

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    settings: { promotion: promotionsSettings = [] },
  } = useSelector((state: any) => state.settings);

  const onFinish = async () => {
    const promotion = form.getFieldsValue(true);
    await doRequest(() => savePromotion(promotion));
    history.push("/promotions");
  };

  return (
    <>
      <PageHeader title="Promotion Update" subTitle="Promotion" />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initial}
        autoComplete="off"
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Brief" name="brief">
              <RichTextEditor formField="brief" form={form} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => history.push("/promotions")}>
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

export default PromotionDetail;
