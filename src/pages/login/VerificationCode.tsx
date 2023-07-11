import { Button, Col, Form, Image, Row, Typography } from 'antd';
import { useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import VerificationInput from 'react-verification-input';

const VerificationCode: React.FC<RouteComponentProps> = props => {
  const { history } = props;
  const [loading, setLoading] = useState<boolean>(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response: any = await console.log('hi'); /* loginService(values) */
      if (response.success) {
        localStorage.setItem('token', response.token);
        history.push('/verification');
      }
    } catch (e) {}
    setLoading(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      <div className="external-wrapper">
        <div className="external-container">
          <Image width="100%" style={{ padding: '5% 10%' }} src="/logo.svg" />
          <Typography.Title level={4}>
            <strong>Email Verification Code</strong>
          </Typography.Title>
          <Typography.Text
            style={{
              width: '100%',
              padding: '0.5rem',
              overflowWrap: 'anywhere',
              whiteSpace: 'normal',
            }}
          >
            If the address you typed matches an account, a 6-Digit verification
            code has been sent to your email address.
          </Typography.Text>
          <Form
            name="auth"
            layout="vertical"
            className="mt-075"
            style={{ transform: 'scale(0.9)' }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            requiredMark={false}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label={<strong>Verification Code</strong>}
              name="email"
              className="mb-05"
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <VerificationInput
                placeholder=""
                classNames={{
                  container: 'container',
                  character: 'character',
                  characterInactive: 'character--inactive',
                  characterSelected: 'character--selected',
                }}
              />
            </Form.Item>
            <Row justify="end" style={{ alignItems: 'baseline' }}>
              <Col span={24}>
                <Form.Item className="my-1">
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ background: 'rgb(48,86,211)', width: '100%' }}
                    loading={loading}
                  >
                    Submit
                  </Button>
                </Form.Item>
                <Button
                  className="mb-1"
                  style={{ width: '100%' }}
                  onClick={() => history.goBack()}
                  loading={loading}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};

export default VerificationCode;
