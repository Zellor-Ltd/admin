import { Button, Col, Form, Input, PageHeader, Row, Switch } from 'antd';
import React from 'react';
import { Masthead } from '../../interfaces/Masthead';
import { Upload } from '../../components';
import { useRequest } from '../../hooks/useRequest';
import { saveMasthead } from '../../services/DiscoClubService';

interface MastheadDetailProps {
  masthead?: Masthead;
  onSave?: (record: Masthead, newItem?: boolean) => void;
  onCancel?: () => void;
}

const CreatorsPageDetail: React.FC<MastheadDetailProps> = ({
  masthead,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { doRequest, loading } = useRequest();

  const onFinish = async () => {
    const formMasthead = form.getFieldsValue(true);
    const { result } = await doRequest(() => saveMasthead(formMasthead));
    formMasthead.id
      ? onSave?.(formMasthead)
      : onSave?.({ ...formMasthead, id: result }, true);
  };

  return (
    <>
      <PageHeader title={masthead ? 'Masthead Update' : 'New Masthead'} />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={masthead}
        autoComplete="off"
      >
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item name="active" label="Active" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item label="Description" name="description">
              <Input allowClear placeholder="Description" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Masthead"
              rules={[{ required: true, message: 'Masthead is required.' }]}
            >
              <Upload.ImageUpload
                type="image"
                maxCount={1}
                fileList={masthead?.image}
                form={form}
                formProp="image"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
          <Col>
            <Button
              type="default"
              className="mt-n2 mb-1"
              onClick={() => onCancel?.()}
            >
              Cancel
            </Button>
          </Col>
          <Col>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className="mt-n2 mb-1"
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CreatorsPageDetail;
