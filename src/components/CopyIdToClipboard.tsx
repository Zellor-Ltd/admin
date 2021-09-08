import { CopyOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function CopyIdToClipboard({ id }: { id: string }) {
  return (
    <CopyToClipboard text={id}>
      <Button
        onClick={() => {
          message.success("Copied _id to Clipboard.");
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
