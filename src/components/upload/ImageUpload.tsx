import { FormInstance, message, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

interface ImageUploadProps {
  fileList: any;
  maxCount?: number;
  form: FormInstance;
  formProp: string | string[];
  accept?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  fileList,
  maxCount = 1,
  form,
  formProp,
  accept = "image/png, image/jpeg",
}) => {
  const [fileListLocal, setfileListLocal] = useState<any>([]);

  useEffect(() => {
    if (fileList) {
      if (typeof fileList === "string") {
        setfileListLocal([{ url: fileList }]);
      }
      if (typeof fileList === "object") {
        setfileListLocal(fileList);
      }
    }
  }, [fileList]);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  function createObjectFromPropArray(
    value: any,
    keys: string[],
    name: string = ""
  ): any {
    if (keys.length === 1)
      return name ? { [name]: { [keys[0]]: {} } } : { [keys[0]]: value };
    else {
      let inner = createObjectFromPropArray(
        value,
        keys.slice(1),
        keys.slice(0, 1)[0]
      );
      if (name) {
        return { [name]: inner };
      }
      return inner;
    }
  }

  const onChangeImage = (info: any) => {
    setfileListLocal(info.fileList);
    if (info.file.status === "removed") {
      const image = form.getFieldValue("image") || [];
      if (typeof formProp === "object") {
        console.log(formProp.slice(0, 1)[0]);
        form.setFieldsValue({
          [formProp.slice(0, 1)[0]]: createObjectFromPropArray(
            image.filter((video: any) => video.status !== "removed"),
            formProp.slice(1)
          ),
        });
      } else {
        form.setFieldsValue({
          [formProp]: image.filter((video: any) => video.status !== "removed"),
        });
      }
    }
    if (info.file.status === "done") {
      const response = JSON.parse(info.file.xhr.response);
      const imageValue = form.getFieldValue("image") || [];
      if (typeof formProp === "object") {
        console.log(formProp.slice(0, 1)[0]);
        form.setFieldsValue({
          [formProp.slice(0, 1)[0]]: createObjectFromPropArray(
            [
              ...imageValue,
              { url: response.result.replace(";", ""), uid: info.file.uid },
            ],
            formProp.slice(1)
          ),
        });
      } else {
        form.setFieldsValue({
          [formProp]: [
            ...imageValue,
            { url: response.result.replace(";", ""), uid: info.file.uid },
          ],
        });
      }
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

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
        action={action}
        headers={{
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }}
        onChange={onChangeImage}
        accept={accept}
        listType="picture-card"
        fileList={fileListLocal}
        maxCount={maxCount}
        onPreview={onPreview}>
        {fileListLocal.length >= maxCount ? null : uploadButton}
      </Upload>
    </>
  );
};

export default ImageUpload;
