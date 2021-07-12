import { Button, Col, Form, Input, PageHeader, Row } from "antd";
import { RichTextEditor } from "components/RichTextEditor";
import { useRequest } from "hooks/useRequest";
import { PromotionWithStatusList } from "interfaces/Promotion";
import { useCallback, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { fetchVideoFeed2, savePromotion } from "services/DiscoClubService";

const PromotionDetail: React.FC<RouteComponentProps> = (props) => {
  const { history, location } = props;
  const initial = location.state as undefined | PromotionWithStatusList;
  const [form] = Form.useForm();
  const { doRequest, doFetch, loading } = useRequest();
  const [packages, setPackages] = useState<any>();

  const onFinish = async () => {
    const promotion = form.getFieldsValue(true);
    await doRequest(() => savePromotion(promotion));
    history.push("/promotions");
  };

  const getPackages = useCallback(async () => {
    const packages = await doFetch(fetchVideoFeed2);
    setPackages(packages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResources = useCallback(async () => {
    await getPackages();
    console.log(initial?.promoStatusList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getResources();
  }, [getResources]);

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
