import { Button, Col, Form, Input, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import { VideoType } from 'interfaces/VideoType';
import { useState } from 'react';
import { saveVideoType } from 'services/DiscoClubService';
interface VideoTypesDetailProps {
  videoType?: VideoType;
  onSave?: (record: VideoType) => void;
  onCancel?: () => void;
}

const VideoTypeDetail: React.FC<VideoTypesDetailProps> = ({
  videoType,
  onSave,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    const formVideoType = form.getFieldsValue(true);
    const { result } = await doRequest(() => saveVideoType(formVideoType));
    formVideoType.id
      ? onSave?.(formVideoType)
      : onSave?.({ ...formVideoType, id: result });
  };

  return (
    <>
      <PageHeader
        title={videoType ? `${videoType.name} Update` : 'New Video Type'}
      />
      <Form
        name="videoTypeForm"
        layout="vertical"
        form={form}
        initialValues={videoType}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col lg={16} xs={24}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: `Name is required.` }]}
              >
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

export default VideoTypeDetail;
