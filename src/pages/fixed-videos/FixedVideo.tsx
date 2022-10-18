import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import { useRequest } from '../../hooks/useRequest';
import { useContext, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import { saveFixedVideo } from '../../services/DiscoClubService';
import { RouteComponentProps } from 'react-router';

const FixedVideo: React.FC<RouteComponentProps> = () => {
  const { isMobile } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const { doRequest } = useRequest({ setLoading });

  const onFinish = async () => {
    try {
      const videoForm = form.getFieldsValue(true);
      await doRequest(() => saveFixedVideo(videoForm));
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);
  };

  return (
    <>
      <PageHeader
        title="Fixed Video"
        subTitle={isMobile ? '' : 'New Fixed Video'}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        autoComplete="off"
      >
        <Row gutter={[8, 8]}>
          <Col lg={12} xs={24}>
            <Col span={24}>
              <Form.Item
                name="explainerVideo"
                label="Explainer Video"
                rules={[
                  {
                    required: true,
                    message: 'Explainer Video ID is required.',
                  },
                ]}
              >
                <Input
                  allowClear
                  id="explainerVideo"
                  placeholder="Explainer Video ID"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="userExperienceVideo"
                label="User Experience Video"
                rules={[
                  {
                    required: true,
                    message: 'User Experience Video is required.',
                  },
                ]}
              >
                <Input
                  allowClear
                  id="userExperienceVideo"
                  placeholder="User Experience Video"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="taggingVideo"
                label="Tagging Video"
                rules={[
                  {
                    required: true,
                    message: 'Tagging Video ID is required.',
                  },
                ]}
              >
                <Input
                  allowClear
                  id="taggingVideo"
                  placeholder="Tagging Video ID"
                />
              </Form.Item>
            </Col>
          </Col>
          <Col span={24}>
            <Row gutter={8} justify="end">
              <Col>
                <Button type="default" onClick={() => form.resetFields()}>
                  Cancel
                </Button>
              </Col>
              <Col>
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                  className="mb-1"
                >
                  Save
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default FixedVideo;
