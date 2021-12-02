import {
  Col,
  FormInstance,
  message,
  Row,
  Tooltip,
  Upload,
  Button,
  Dropdown,
  Menu,
} from 'antd';
import {
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  FileImageOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { PlusOutlined } from '@ant-design/icons';
import React, {
  useCallback,
  useEffect,
  useState,
  cloneElement,
  ReactElement,
} from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './ImageUpload.scss';

interface ImageUploadProps {
  fileList: any;
  maxCount?: number;
  form: FormInstance;
  formProp: string | string[];
  accept?: string;
  onOrder?: CallableFunction;
  onFitTo?: (
    fitTo: 'w' | 'h',
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl',
    imageIndex: number
  ) => void;
  onAssignToThumbnail?: CallableFunction;
  onAssignToTag?: CallableFunction;
}

interface ImageDnDProps {
  originNode: React.ReactElement;
  moveRow;
  file;
  fileList;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  fileList,
  maxCount = 1,
  form,
  formProp,
  accept = 'image/png, image/jpeg',
  onOrder,
  onFitTo,
  onAssignToThumbnail,
  onAssignToTag,
}) => {
  const [fileListLocal, setFileListLocal] = useState<any>([]);
  const dndType = 'DND-IMAGE';

  useEffect(() => {
    if (fileList) {
      if (typeof fileList === 'string') {
        setFileListLocal([{ url: fileList }]);
      }

      if (typeof fileList === 'object') {
        if (fileList.length > 0) setFileListLocal(fileList);
        else setFileListLocal([fileList]);
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
    name: string = ''
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
    if (typeof formProp === 'string') {
      if (info.file.status === 'removed') {
        form.setFieldsValue({
          [formProp]: {},
        });
      }
      if (info.file.status === 'done') {
        const response = JSON.parse(info.file.xhr.response);
        form.setFieldsValue({
          [formProp]: {
            url: response.result.replace(';', ''),
            uid: info.file.uid,
          },
        });
      }
    }
  };

  const onChangeImage = (info: any) => {
    setFileListLocal(info.fileList);
    console.log(fileListLocal);
    if (maxCount === 1) {
      handleMaxOneImage(info);
    } else {
      if (info.file.status === 'removed') {
        const image = form.getFieldValue('image') || [];
        if (typeof formProp === 'object') {
          form.setFieldsValue({
            [formProp.slice(0, 1)[0]]: createObjectFromPropArray(
              image.filter((video: any) => video.status !== 'removed'),
              formProp.slice(1)
            ),
          });
        } else {
          form.setFieldsValue({
            [formProp]: image.filter(
              (video: any) => video.status !== 'removed'
            ),
          });
        }
      }
      if (info.file.status === 'done') {
        const response = JSON.parse(info.file.xhr.response);
        const imageValue = form.getFieldValue('image') || [];
        if (typeof formProp === 'object') {
          form.setFieldsValue({
            [formProp.slice(0, 1)[0]]: createObjectFromPropArray(
              [
                ...imageValue,
                { url: response.result.replace(';', ''), uid: info.file.uid },
              ],
              formProp.slice(1)
            ),
          });
        } else {
          console.log(formProp);
          form.setFieldsValue({
            [formProp]: [
              ...imageValue,
              { url: response.result.replace(';', ''), uid: info.file.uid },
            ],
          });
        }
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    }
  };

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    if (accept === 'video/*') {
      window.open(src);
    } else {
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    }
  };

  const ImageDnD: React.FC<ImageDnDProps> = ({
    originNode,
    moveRow,
    file,
    fileList,
  }) => {
    const ref = React.useRef<HTMLDivElement>();
    const index = fileList.indexOf(file);

    const fitToWidthSelectedClass = file.fitTo === 'w' ? 'fit-to-selected' : '';
    const fitHeightSelectedClass = file.fitTo === 'h' ? 'fit-to-selected' : '';

    const [{ isOver, dropClassName }, drop] = useDrop({
      accept: dndType,
      collect: monitor => {
        const { index: dragIndex } = (monitor.getItem() || {}) as any;
        if (dragIndex === index) {
          return {};
        }
        return {
          isOver: monitor.isOver(),
          dropClassName:
            dragIndex < index ? ' drop-over-right' : ' drop-over-left',
        };
      },
      drop: (item: any) => {
        moveRow(item.index, index);
      },
    });
    const [, drag] = useDrag({
      type: dndType,
      item: { index },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    });

    const actionButtons: ReactElement[] = [];

    if (onFitTo) {
      actionButtons.push(
        <Col lg={6} xs={24}>
          <Tooltip title="Fit to Width">
            <Button
              size="small"
              shape="circle"
              className={fitToWidthSelectedClass}
              icon={<ColumnWidthOutlined />}
              onClick={() => onFitTo('w', formProp as any, index)}
            />
          </Tooltip>
        </Col>
      );

      actionButtons.push(
        <Col lg={6} xs={24}>
          <Tooltip title="Fit to Height">
            <Button
              size="small"
              shape="circle"
              className={fitHeightSelectedClass}
              icon={<ColumnHeightOutlined />}
              onClick={() => onFitTo('h', formProp as any, index)}
            />
          </Tooltip>
        </Col>
      );
    }

    if (onAssignToThumbnail) {
      actionButtons.push(
        <Col lg={6} xs={24}>
          <Tooltip title="Assign to Thumbnail">
            <Button
              size="small"
              shape="circle"
              icon={<FileImageOutlined />}
              onClick={() => onAssignToThumbnail(file)}
            />
          </Tooltip>
        </Col>
      );
    }

    if (onAssignToTag) {
      actionButtons.push(
        <Col lg={6} xs={24}>
          <Tooltip title="Assign to Tag">
            <Button
              size="small"
              shape="circle"
              icon={<TagOutlined />}
              onClick={() => onAssignToTag(file)}
            />
          </Tooltip>
        </Col>
      );
    }

    if (onOrder) {
      drop(drag(ref));

      const node = cloneElement(originNode, {
        className: originNode.props.className + dropClassName,
      });

      return (
        <div
          ref={ref as any}
          className={isOver ? dropClassName : ''}
          style={{
            cursor: fileList.length && fileList.length > 1 ? 'move' : 'cursor',
          }}
        >
          {node}
          <Row className="fit-to-icons-container" justify="space-around">
            {actionButtons}
          </Row>
        </div>
      );
    }

    return (
      <>
        {originNode}
        <Row className="fit-to-icons-container" justify="space-around">
          {actionButtons}
        </Row>
      </>
    );
  };

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      onOrder?.(dragIndex, hoverIndex);
    },
    [fileList]
  );

  const itemRender = (originNode: React.ReactElement, file, currFileList) => {
    if (onOrder || onFitTo || onAssignToTag || onAssignToThumbnail) {
      return (
        <ImageDnD
          originNode={originNode}
          file={file}
          fileList={currFileList}
          moveRow={moveRow}
        />
      );
    }

    return originNode;
  };

  const action = `${process.env.REACT_APP_HOST_ENDPOINT}/Wi/Upload`;

  return (
    <DndProvider backend={HTML5Backend}>
      <Upload
        action={action}
        headers={{
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }}
        onChange={onChangeImage}
        accept={accept}
        listType="picture-card"
        fileList={fileListLocal}
        maxCount={maxCount}
        onPreview={onPreview}
        itemRender={itemRender}
      >
        {fileListLocal.length >= maxCount ? null : uploadButton}
      </Upload>
    </DndProvider>
  );
};

export default ImageUpload;
