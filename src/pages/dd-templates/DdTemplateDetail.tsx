import { Button, Col, Form, Input, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { DdTemplate } from 'interfaces/DdTemplate';
import { useState } from 'react';
import { saveDdTemplate } from 'services/DiscoClubService';
interface DdTemplatesDetailProps {
  template: DdTemplate | undefined;
  setDetails: any;
}

const DdTemplatesDetail: React.FC<DdTemplatesDetailProps> = ({
  template,
  setDetails,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const ddTemplate = form.getFieldsValue(true);
    await doRequest(() => saveDdTemplate(ddTemplate));
    setDetails(false);
  };

  return (
    <>
      <PageHeader
        title={template ? `${template.tagName} Template Update` : 'New Item'}
        subTitle="Disco Dollar Template "
      />
      <Form
        name="ddTemplateForm"
        layout="vertical"
        form={form}
        initialValues={template}
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

export default DdTemplatesDetail;
