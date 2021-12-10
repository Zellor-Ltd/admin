import { Button, Col, Form, Input, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { saveDdTemplate } from 'services/DiscoClubService';

const DdTemplatesDetail: React.FC<RouteComponentProps> = props => {
  const { history, location } = props;
  const initial: any = location.state;
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const ddTemplate = form.getFieldsValue(true);
    await doRequest(() => saveDdTemplate(ddTemplate));
    history.goBack();
  };

  return (
    <>
      <PageHeader
        title={initial ? `${initial.tagName} Template Update` : "New Item"}
        subTitle="Disco Dollar Template "
      />
      <Form
        name="ddTemplateForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Tag Name"
                name="tagName"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Template"
                name="template"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Disco Gold"
                name="discoGold"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Disco Dollars"
                name="discoDollars"
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
            <Button loading={loading} type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default DdTemplatesDetail;
