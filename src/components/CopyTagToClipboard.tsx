import { CopyOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function CopyTagToClipboard({ tag }: { tag: string }) {
  return (
    <CopyToClipboard text={tag}>
      <Button
        onClick={() => {
          if (tag) {
            message.success("Copied _tag to Clipboard.");
          } else {
            message.warning("Warning: no tag to copy.");
          }
        }}
        type="link"
        style={{
          borderWidth: "1px",
          borderColor: "#1890ff",
          borderStyle: "solid",
          width: "36px",
          padding: "0px 6px",
        }}
      >
        <CopyOutlined />
      </Button>
    </CopyToClipboard>
  );
}
