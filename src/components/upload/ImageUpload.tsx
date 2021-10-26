import { FormInstance, message, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { UploadFile } from "antd/lib/upload/interface";

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
        if (fileList.length > 0) setfileListLocal(fileList);
        else setfileListLocal([fileList]);
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

  const handleMaxOneImage = (info: any) => {
    if (typeof formProp === "string") {
      if (info.file.status === "removed") {
        form.setFieldsValue({
          [formProp]: {},
        });
      }
      if (info.file.status === "done") {
        const response = JSON.parse(info.file.xhr.response);
        form.setFieldsValue({
          [formProp]: {
            url: response.result.replace(";", ""),
            uid: info.file.uid,
          },
        });
      }
    }
  };

  const onDragEnd = (result: any) => {
    console.log(result);
  };

  const onChangeImage = (info: any) => {
    setfileListLocal(info.fileList);
    console.log(fileListLocal);
    if (maxCount === 1) {
      handleMaxOneImage(info);
    } else {
      if (info.file.status === "removed") {
        const image = form.getFieldValue("image") || [];
        if (typeof formProp === "object") {
          form.setFieldsValue({
            [formProp.slice(0, 1)[0]]: createObjectFromPropArray(
              image.filter((video: any) => video.status !== "removed"),
              formProp.slice(1)
            ),
          });
        } else {
          form.setFieldsValue({
            [formProp]: image.filter(
              (video: any) => video.status !== "removed"
            ),
          });
        }
      }
      if (info.file.status === "done") {
        const response = JSON.parse(info.file.xhr.response);
        const imageValue = form.getFieldValue("image") || [];
        if (typeof formProp === "object") {
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
          console.log(formProp);
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
    if (accept === "video/*") {
      window.open(src);
    } else {
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
  };

  const action = `${process.env.REACT_APP_HOST_ENDPOINT}/Wi/Upload`;

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="id">
          {(provided) => (
            <Upload
              ref={provided.innerRef}
              {...provided.droppableProps}
              action={action}
              headers={{
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }}
              onChange={onChangeImage}
              accept={accept}
              listType="picture-card"
              fileList={fileListLocal}
              maxCount={maxCount}
              onPreview={onPreview}
              itemRender={(originNode, file: UploadFile, currFileList) => (
                <Draggable
                  draggableId={file.uid}
                  index={currFileList.indexOf(file)}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    ></div>
                  )}
                </Draggable>
              )}
            >
              {fileListLocal.length >= maxCount ? null : uploadButton}
              {provided.placeholder}
            </Upload>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default ImageUpload;
