import { CopyOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function CopyValueToClipboard({ value }: { value: string }) {
  return (
    <CopyToClipboard text={value}>
      <Button
        onClick={() => {
          message.success('Copied value to Clipboard.');
        }}
        type="link"
        style={{
          borderWidth: '1px',
          borderColor: '#1890ff',
          borderStyle: 'solid',
          width: '36px',
          padding: '0px 6px',
        }}
      >
        <CopyOutlined />
      </Button>
    </CopyToClipboard>
  );
}
