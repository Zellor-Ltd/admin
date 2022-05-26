import { CopyOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import React, { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { RouteComponentProps } from 'react-router-dom';
import { getMasterPassword } from 'services/DiscoClubService';

const MasterPassword: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [masterPassword, setMasterPassword] = useState<string>('');

  const onFinish = async (values: any) => {
    const response: any = await doFetch(
      () => getMasterPassword(values.id),
      true
    );
    setMasterPassword(response.token);
  };

  return (
    <div>
      <PageHeader
        title="Master Password"
        subTitle="Get a new Master Password"
      />
      {!masterPassword ? (
        <Form onFinish={onFinish}>
          <Row gutter={8}>
            <Col lg={4} xs={24}>
              <Form.Item label="ID" name="id" rules={[{ required: true }]}>
                <Input placeholder="Enter ID" />
              </Form.Item>
            </Col>
            <Col lg={4} xs={24}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Get Master Password
              </Button>
            </Col>
          </Row>
        </Form>
      ) : (
        <p>
          New master password generated:&nbsp;
          <b style={{ fontSize: '16px' }}>{masterPassword}</b>
          <CopyToClipboard text={masterPassword}>
            <Button
              onClick={() => {
                message.success('Copied password to Clipboard.');
              }}
              type="link"
              style={{
                marginLeft: '-8px',
              }}
            >
              <CopyOutlined />
            </Button>
          </CopyToClipboard>
        </p>
      )}
    </div>
  );
};

export default MasterPassword;
