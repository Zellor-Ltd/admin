import { CopyOutlined } from '@ant-design/icons';
import { Button, Tooltip, message } from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';

export default function CopyValueToClipboard({
  value,
  tooltipText,
}: {
  value: string;
  tooltipText: string;
}) {
  return (
    <CopyToClipboard text={value}>
      <Tooltip title={tooltipText}>
        <Button
          onClick={() => {
            message.success('Copied value to Clipboard.');
          }}
          type="link"
          style={{
            borderWidth: '1px',
            borderColor: 'rgb(245,203,221)',
            borderStyle: 'solid',
            width: '36px',
            padding: '0px 6px',
          }}
        >
          <CopyOutlined />
        </Button>
      </Tooltip>
    </CopyToClipboard>
  );
}
