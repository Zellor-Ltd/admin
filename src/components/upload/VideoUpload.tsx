import { Upload } from "antd";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { PlusOutlined } from "@ant-design/icons";

interface ImageUploadProps {
  onChange: (file: UploadChangeParam<UploadFile<any>>) => void;
  fileList: any;
  maxCount: number;
}

const VideoUpload: React.FC<ImageUploadProps> = ({
  onChange,
  fileList,
  maxCount,
}) => {
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const action = `${process.env.REACT_APP_HOST_ENDPOINT}/Wi/Upload`;

  return (
    <Upload
      action={(file) => {
        console.log(file);
        return action;
      }}
      data={(test) => console.log(test.url)}
      headers={{
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      }}
      onChange={onChange}
      accept="video/*"
      listType="picture-card"
      fileList={fileList}
      maxCount={maxCount}>
      {fileList.length > 0 ? null : uploadButton}
    </Upload>
  );
};

export default VideoUpload;
