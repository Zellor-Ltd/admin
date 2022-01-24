import { Button, Col, Form, Input, InputNumber, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { DdTemplate } from 'interfaces/DdTemplate';
import { useState } from 'react';
import { saveDdTemplate } from 'services/DiscoClubService';
interface DdTemplatesDetailProps {
  template: DdTemplate | undefined;
  onSave?: (record: DdTemplate) => void;
  onCancel?: () => void;
}

const DdTemplatesDetail: React.FC<DdTemplatesDetailProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const formDdTemplate = form.getFieldsValue(true);
    const { result } = await doRequest(() => saveDdTemplate(formDdTemplate));
    formDdTemplate.id
      ? onSave?.(formDdTemplate)
      : onSave?.({ ...formDdTemplate, id: result });
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
                rules={[{ required: true, message: `Tag Name is required.` }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Template"
                name="template"
                rules={[{ required: true, message: `Template is required.` }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Disco Gold"
                name="discoGold"
                rules={[{ required: true, message: `Disco Gold is required.` }]}
              >
                <InputNumber />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Disco Dollars"
                name="discoDollars"
                rules={[
                  { required: true, message: `Disco Dollars is required.` },
                ]}
              >
                <InputNumber />
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
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
