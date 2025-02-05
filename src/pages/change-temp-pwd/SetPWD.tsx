/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import React, { useState } from 'react';
import { setPwd } from 'services/AdminService';

const SetPWD: React.FC<{}> = () => {
  const [form] = Form.useForm();
  const [password, setPassword] = useState('');
  const [passwordHasFocus, setPasswordHasFocus] = useState(false);

  const isPasswordValid =
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&]/.test(password);

  const handleFinishFailed = (errorFields: any[]) => {
    message.error('Error: ' + errorFields[0].errors[0]);
  };

  const onFinish = async () => {
    try {
      if (!isPasswordValid) return;

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
                    <Input type="email" allowClear placeholder="Email" />
                  </Form.Item>
                  <Form.Item label="Old Password" name="tempPassword">
                    <Input allowClear placeholder="Old Password" />
                  </Form.Item>
                  <Form.Item label="New Password" name="newPassword">
                    <Input
                      allowClear
                      placeholder="New Password"
                      onFocus={() => setPasswordHasFocus(true)}
                      onBlur={() => setPasswordHasFocus(false)}
                      onChange={e => setPassword(e.target.value)}
                    />
                    {passwordHasFocus && (
                      <ul className="relative right-8 top-2 mt-1 text-xs list-disc list-inside text-red-400">
                        <div className="mt-2 pt-2 text-xs text-gray-500">
                          Password must contain at least
                        </div>
                        <li
                          className={
                            password.length >= 6 ? 'text-green-400' : ''
                          }
                        >
                          6 characters
                        </li>
                        <li
                          className={
                            /[A-Z]/.test(password) ? 'text-green-400' : ''
                          }
                        >
                          1 uppercase letter
                        </li>
                        <li
                          className={
                            /[a-z]/.test(password) ? 'text-green-400' : ''
                          }
                        >
                          1 lowercase letter
                        </li>
                        <li
                          className={
                            /\d/.test(password) ? 'text-green-400' : ''
                          }
                        >
                          1 number
                        </li>
                        <li
                          className={
                            /[@$!%*?&]/.test(password) ? 'text-green-400' : ''
                          }
                        >
                          1 special character
                        </li>
                      </ul>
                    )}
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
