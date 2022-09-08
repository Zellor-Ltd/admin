import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { saveRole } from 'services/DiscoClubService';

const RoleDetail: React.FC<RouteComponentProps> = props => {
  const { history, location } = props;
  const [loading, setLoading] = useState(false);
  const initial: any = location.state;
  const [form] = Form.useForm();

  const onFinish = async () => {
    setLoading(true);
    try {
      const role = form.getFieldsValue(true);
      await saveRole(role);
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
        title={initial ? `${initial.name ?? ''} Update` : 'New Item'}
      />
      <Form
        name="roleForm"
        layout="vertical"
        form={form}
        initialValues={initial}
        onFinish={onFinish}
      >
        <Row gutter={8}>
          <Col lg={12} xs={24}>
            <Col span={24}>
              <Form.Item label="Name" name="name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Description" name="description">
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Col>
        </Row>
        <Row gutter={8} justify="end">
          <Col>
            <Button type="default" onClick={() => history.goBack()}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Col>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
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

export default RoleDetail;
