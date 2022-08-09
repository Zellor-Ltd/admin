import { FormInstance } from 'antd';
// import { UploadChangeParam } from "antd/lib/upload";
// import { UploadFile } from "antd/lib/upload/interface";
// import { PlusOutlined } from "@ant-design/icons";
// import { useEffect, useState } from "react";
import ImageUpload from './ImageUpload';

interface VideoUploadProps {
  fileList: any;
  form: FormInstance;
  formProp: string | string[];
  maxCount?: number;
  accept?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = props => {
  const {
    // fileList,
    // form,
    // formProp,
    accept = 'video/*',
  } = props;
  // const [fileListLocal, setfileListLocal] = useState<any>([]);

  // useEffect(() => {
  //   if (fileList) {
  //     if (typeof fileList === "string") {
  //       setfileListLocal([{ url: fileList }]);
  //     }
  //     if (typeof fileList === "object") {
  //       setfileListLocal(fileList);
  //     }
  //   }
  // }, [fileList]);
  // const uploadButton = (
  //   <div>
  //     <PlusOutlined />
  //     <div style={{ marginTop: 8 }}>Upload</div>
  //   </div>
  // );

  // const onChangeVideo = (info: any) => {
  //   setfileListLocal(info.fileList);
  //   if (info.file.status === "removed") {
  //     const image = form.getFieldValue("image") || [];
  //     form.setFieldsValue({
  //       [formProp]: image.filter((video: any) => video.status !== "removed"),
  //     });
  //   }
  //   if (info.file.status === "done") {
  //     const response = JSON.parse(info.file.xhr.response);
  //     const imageValue = form.getFieldValue("image") || [];

  //     form.setFieldsValue({
  //       [formProp]: [
  //         ...imageValue,
  //         { url: response.result.replace(";", ""), uid: info.file.uid },
  //       ],
  //     });
  //     message.success(`${info.file.name} file uploaded successfully`);
  //   } else if (info.file.status === "error") {
  //     message.error(`Error: ${info.file.name} file upload failed.`);
  //   }
  // };

  // const action = `${process.env.REACT_APP_HOST_ENDPOINT}/Wi/Upload`;

  return (
    <ImageUpload {...props} accept={accept} />
    // <Upload
    //   action={action}
    //   headers={{
    //     Authorization: `Bearer ${localStorage.getItem("token")}`,
    //   }}
    //   onChange={onChangeVideo}
    //   accept={accept}
    //   listType="picture-card"
    //   fileList={fileListLocal}
    //   maxCount={maxCount}>
    //   {fileListLocal.length >= maxCount ? null : uploadButton}
    // </Upload>
  );
};

export default VideoUpload;
