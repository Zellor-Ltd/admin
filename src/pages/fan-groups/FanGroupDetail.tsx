import { Button, Col, Form, Input, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import { useState } from 'react';
import { saveFanGroup } from 'services/DiscoClubService';
interface FanGroupsDetailProps {
  fanGroup?: FanGroup;
  onSave?: (record: FanGroup) => void;
  onCancel?: () => void;
}

const FanGroupsDetail: React.FC<FanGroupsDetailProps> = ({
  fanGroup,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const formFanGroup = form.getFieldsValue(true);
    const { result } = await doRequest(() => saveFanGroup(formFanGroup));
    formFanGroup.id
      ? onSave?.(formFanGroup)
      : onSave?.({ ...formFanGroup, id: result });
  };

  return (
    <>
      <PageHeader
        title={fanGroup ? `${fanGroup.name ?? ''} Update` : 'New Fan Group'}
      />
      <Form
        name="fanGroupForm"
        layout="vertical"
        form={form}
        initialValues={fanGroup}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Name is required.' }]}
              >
                <Input allowClear />
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
          <Col>
            <Button type="default" onClick={() => onCancel?.()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Col>
              <Button loading={loading} type="primary" htmlType="submit">
                Save Changes
              </Button>
            </Col>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default FanGroupsDetail;
