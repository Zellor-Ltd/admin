/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import React from 'react';
import { setPwd } from 'services/AdminService';

const SetPWD: React.FC<{}> = () => {
  const [form] = Form.useForm();

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);
  };

  const onFinish = async () => {
    try {
      const pwdForm = form.getFieldsValue(true);
      await setPwd(pwdForm);

      message.success('Password updated with success.');
    } catch (error: any) {
      message.error('Error: ' + error.error);
    }
  };

  return (
    <>
      <PageHeader title="Change Temp Password" />
      <Form.Provider>
        <Form
          name="form"
          layout="vertical"
          form={form}
          onFinish={onFinish}
          onFinishFailed={({ errorFields }) => handleFinishFailed(errorFields)}
        >
          <Row gutter={8}>
            <Col lg={12} xs={24}>
              <Row gutter={8}>
                <Col span={12} className="mt-2 ml-15">
                  <Form.Item label="Email" name="email">
                    <Input allowClear placeholder="Email" />
                  </Form.Item>
                  <Form.Item label="Old Password" name="oldPwd">
                    <Input allowClear placeholder="Old Password" />
                  </Form.Item>
                  <Form.Item label="New Password" name="newPwd">
                    <Input allowClear placeholder="New Password" />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            gutter={8}
            justify="end"
            style={{ position: 'absolute', bottom: '2rem', right: '2rem' }}
          >
            <Col>
              <Button type="primary" htmlType="submit" className="mb-1">
                Save Changes
              </Button>
            </Col>
          </Row>
        </Form>
      </Form.Provider>
    </>
  );
};

export default SetPWD;
