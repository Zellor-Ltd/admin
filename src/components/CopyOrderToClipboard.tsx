import { CopyOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function CopyOrderToClipboard({ order }: { order: string }) {
  return (
    <CopyToClipboard text={order}>
      <Button
        onClick={() => {
          if (order) {
            message.success('Copied _id to Clipboard.');
          } else {
            message.warning('Warning: no id to copy.');
          }
        }}
        type="link"
        style={{
          borderWidth: '1px',
          borderColor: '#212427',
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
