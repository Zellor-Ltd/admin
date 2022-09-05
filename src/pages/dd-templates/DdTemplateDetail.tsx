import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  PageHeader,
  Row,
} from 'antd';
import { useRequest } from 'hooks/useRequest';
import { DdTemplate } from 'interfaces/DdTemplate';
import { useContext, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { saveDdTemplate } from 'services/DiscoClubService';
import scrollIntoView from 'scroll-into-view';
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
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    try {
      const formDdTemplate = form.getFieldsValue(true);
      const { result } = await doRequest(() => saveDdTemplate(formDdTemplate));
      formDdTemplate.id
        ? onSave?.(formDdTemplate)
        : onSave?.({ ...formDdTemplate, id: result });
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);

    const id = errorFields[0].name[0];
    const element = document.getElementById(id);

    scrollIntoView(element);
  };

  return (
    <>
      <PageHeader
        title={
          template
            ? `${template.tagName ?? ''} Update`
            : 'New Disco Dollar Template'
        }
      />
      <Form
        name="ddTemplateForm"
        layout="vertical"
        form={form}
        initialValues={template}
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Tag Name"
                name="tagName"
                rules={[{ required: true, message: 'Tag Name is required.' }]}
              >
                <Input id="tagName" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Template"
                name="template"
                rules={[{ required: true, message: 'Template is required.' }]}
              >
                <Input id="template" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Disco Gold"
                name="discoGold"
                rules={[{ required: true, message: 'Disco Gold is required.' }]}
              >
                <InputNumber id="discoGold" />
              </Form.Item>
            </Col>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Disco Dollars"
                name="discoDollars"
                rules={[
                  { required: true, message: 'Disco Dollars is required.' },
                ]}
              >
                <InputNumber id="discoDollars" />
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8} justify={isMobile ? 'end' : undefined}>
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Col>
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                className="mb-1"
              >
                Save Changes
              </Button>
            </Col>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default DdTemplatesDetail;
