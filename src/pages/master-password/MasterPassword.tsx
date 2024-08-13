import { CopyOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, PageHeader, Row } from 'antd';
import { useRequest } from 'hooks/useRequest';
import React, { useContext, useState } from 'react';
import { AppContext } from 'contexts/AppContext';
import CopyToClipboard from 'react-copy-to-clipboard';
import { RouteComponentProps } from 'react-router-dom';
import { getMasterPassword } from 'services/DiscoClubService';

const MasterPassword: React.FC<RouteComponentProps> = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { doFetch } = useRequest({ setLoading });
  const [masterPassword, setMasterPassword] = useState<string>('');
  const { isMobile } = useContext(AppContext);

  const onFinish = async (values: any) => {
    const response: any = await doFetch(
      () => getMasterPassword(values.id),
      true
    );
    setMasterPassword(response.token);
  };

  return (
    <>
      <PageHeader
        title="Master Password"
        subTitle={isMobile ? '' : 'Get a new Master Password'}
        className={isMobile ? 'mb-n1' : ''}
      />
      {!masterPassword ? (
        <Form className="" onFinish={onFinish}>
          <Row gutter={8} justify={isMobile ? 'end' : 'start'}>
            <Col lg={4} xs={24} style={{ marginTop: '2rem' }}>
              <Form.Item label="ID" name="id" rules={[{ required: true }]}>
                <Input allowClear placeholder="Enter ID" />
              </Form.Item>
            </Col>
            <Col lg={6} xs={24}>
              <Row justify={isMobile ? 'end' : undefined}>
                <Col>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Get Master Password
                  </Button>
                </Col>
              </Row>
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
    </>
  );
};

export default MasterPassword;
