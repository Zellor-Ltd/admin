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
    await doRequest(() => saveFanGroup(formFanGroup));
    onSave?.(formFanGroup);
  };

  return (
    <>
      <PageHeader title="Fan Group Update" subTitle="Fan Group" />
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
              <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                <Input />
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

export default FanGroupsDetail;
