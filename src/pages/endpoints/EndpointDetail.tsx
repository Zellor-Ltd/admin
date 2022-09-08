import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  PageHeader,
  Radio,
  Row,
} from 'antd';
import { Endpoint } from 'interfaces/Endpoint';
import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { saveEndpoint } from 'services/DiscoClubService';

const EndpointDetail: React.FC<RouteComponentProps> = ({
  history,
  location,
}) => {
  const initial = location.state as Endpoint;
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    if (initial?.id) {
      form.setFieldsValue({ ...initial });
    } else {
      form.setFieldsValue({
        name: '',
        description: '',
        container: '',
        action: 'Search',
        application: 'Custom',
        isActive: false,
      });
    }
  }, [form, initial]);

  const onFinish = async () => {
    setLoading(true);
    try {
      const endpoint: Endpoint = form.getFieldsValue(true);

      await saveEndpoint(endpoint);
      setLoading(false);
      message.success('Register updated with success.');
      history.goBack();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title={initial ? `${initial.name ?? ''} Update` : 'New Endpoint'}
      />
      <Form
        name="endpointForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={6} xs={24}>
            <Form.Item label="Name" name="name">
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Description" name="description">
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Container" name="container">
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item label="Application" name="application">
              <Input allowClear disabled />
            </Form.Item>
          </Col>

          <Col lg={12} xs={24}>
            <Form.Item name="action">
              <Radio.Group>
                <Radio value="Search">Search</Radio>
                <Radio value="Insert">Insert</Radio>
                <Radio value="Update">Update</Radio>
                <Radio value="Delete">Delete</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col lg={6} xs={24}>
            <Form.Item name="isActive">
              <Checkbox disabled checked={initial?.isActive ?? false}>
                isActive
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
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
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default EndpointDetail;
