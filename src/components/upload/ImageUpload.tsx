import { Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

interface ImageUploadProps {
  onChange: (file: UploadChangeParam<UploadFile<any>>) => void;
  fileList: any;
  maxCount: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
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

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const action = `${process.env.REACT_APP_HOST_ENDPOINT}/Wi/Upload`;

  return (
    <>
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
        accept="image/png, image/jpeg"
        listType="picture-card"
        fileList={fileList}
        maxCount={maxCount}
        onPreview={onPreview}>
        {fileList.length > 0 ? null : uploadButton}
      </Upload>
    </>
  );
};

export default ImageUpload;
