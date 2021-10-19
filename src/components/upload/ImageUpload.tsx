import { FormInstance, message, Upload, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

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

  const onChangeImage = (info: any) => {
    setfileListLocal(info.fileList);
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

  const type = "DragableUploadList";

  const DragableUploadListItem = ({
    originNode,
    moveRow,
    file,
    fileListLocal,
  }) => {
    const ref = React.useRef();
    const index = fileListLocal.indexOf(file);
    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: type,
      collect: (monitor) => {
        const { index: dragIndex } = monitor.getItem() || {};
        if (dragIndex === index) {
          return {};
        }
        return {
          isOver: monitor.isOver(),
          dropClassName:
            dragIndex < index ? " drop-over-downward" : " drop-over-upward",
        };
      },
      drop: (item) => {
        moveRow(item.index, index);
      },
    });
    const [, drag] = useDrag({
      type,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });
    drop(drag(ref));
    const errorNode = (
      <Tooltip title="Upload Error">{originNode.props.children}</Tooltip>
    );
    return (
      <div
        ref={ref}
        className={`ant-upload-draggable-list-item ${
          isOver ? dropClassName : ""
        }`}
        style={{ cursor: "move" }}
      >
        {file.status === "error" ? errorNode : originNode}
      </div>
    );
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = fileListLocal[dragIndex];
      setfileListLocal(
        update(fileListLocal, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
    },
    [fileListLocal]
  );

  return (
    <>
      <DndProvider backend={HTML5Backend}>
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
          onPreview={onPreview}
          itemRender={(originNode, file, currfileListLocal) => (
            <DragableUploadListItem
              originNode={originNode}
              file={file}
              fileListLocal={currfileListLocal}
              moveRow={moveRow}
            />
          )}
        >
          {fileListLocal.length >= maxCount ? null : uploadButton}
        </Upload>
      </DndProvider>
    </>
  );
};

export default ImageUpload;
