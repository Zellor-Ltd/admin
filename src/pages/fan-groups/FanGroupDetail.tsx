import { Button, Col, Form, Input, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { FanGroup } from 'interfaces/FanGroup';
import { useState } from 'react';
import { saveFanGroup } from 'services/DiscoClubService';
interface FanGroupsDetailProps {
  fanGroup?: FanGroup;
  setDetails: Function;
}

const FanGroupsDetail: React.FC<FanGroupsDetailProps> = ({
  fanGroup,
  setDetails,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const fanGroup = form.getFieldsValue(true);
    await doRequest(() => saveFanGroup(fanGroup));
    setDetails(false);
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

export default FanGroupsDetail;
