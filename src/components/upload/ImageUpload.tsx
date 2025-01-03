/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Col, FormInstance, message, Row, Tooltip, Upload } from 'antd';
import {
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  FileImageOutlined,
  PlusOutlined,
  RollbackOutlined,
  ScissorOutlined,
  TagOutlined,
} from '@ant-design/icons';
import React, {
  cloneElement,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './ImageUpload.scss';
import ImageCrop from '../ImageCrop';
import { uploadImage } from '../../services/DiscoClubService';
import classNames from 'classnames';
import { Image } from '../../interfaces/Image';

const classNamesFn = classNames;

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
  onRollback?: (
    oldUrl: string,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    imageIndex: number
  ) => void;
  onAssignToMasthead?: CallableFunction;
  onAssignToThumbnail?: CallableFunction;
  onAssignToTag?: CallableFunction;
  croppable?: boolean;
  scrollOverflow?: boolean;
  classNames?: string;
  onImageChange?: (
    image: Image,
    sourceProp: 'image' | 'tagImage' | 'thumbnailUrl' | 'masthead',
    removed?: boolean
  ) => void;
  disabled?: boolean;
  type: string;
  id?: string;
}

interface ImageDnDProps {
  originNode: React.ReactElement;
  moveRow;
  file;
  fileList;
  type;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  fileList,
  maxCount = 1,
  form,
  formProp,
  accept = 'image/png, image/jpeg',
  onOrder,
  onFitTo,
  onRollback,
  onAssignToMasthead,
  onAssignToThumbnail,
  onAssignToTag,
  croppable,
  scrollOverflow,
  classNames = '',
  onImageChange,
  disabled = false,
  type,
  id,
}) => {
  const [fileListLocal, setFileListLocal] = useState<any>([]);
  const [isCropping, setIsCropping] = useState(false);
  const [croppingImage, setCroppingImage] = useState<any>();
  const [isUploadingCrop, setIsUploadingCrop] = useState(false);
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
    <div className="custom-upload-button">
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
          [formProp]: response.result.replace(';', ''),
        });
        onImageChange?.(
          info.file,
          formProp as any,
          info.file.status === 'removed'
        );
      }
    }
  };

  const onChangeImage = (info: any) => {
    setFileListLocal(info.fileList);
    if (maxCount === 1) {
      handleMaxOneImage(info);
    } else {
      if (info.file.status === 'removed') {
        const image =
          form.getFieldValue('masthead') || form.getFieldValue('image') || [];
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
        onImageChange?.(info.file, formProp as any, true);
      }
      if (info.file.status === 'done') {
        const response = JSON.parse(info.file.xhr.response);
        const imageData: any = response.result.replace(';', '');
        updateForm(imageData);
        onImageChange?.(imageData, formProp as any);
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`Error: ${info.file.name} file upload failed.`);
      }
    }
  };

  const updateForm = (imageData: any) => {
    const imageValue =
      form.getFieldValue('masthead') || form.getFieldValue('image') || [];
    if (typeof formProp === 'object') {
      form.setFieldsValue({
        [formProp.slice(0, 1)[0]]: createObjectFromPropArray(
          [...imageValue, imageData],
          formProp.slice(1)
        ),
      });
    } else {
      form.setFieldsValue({
        [formProp]: [...imageValue, imageData],
      });
    }
  };

  const onCropFinish = (imageCanvas: HTMLCanvasElement) => {
    setIsUploadingCrop(true);
    imageCanvas.toBlob(async imageBlob => {
      if (!!imageBlob) {
        try {
          const fileName = 'cropped-'.concat(
            croppingImage.uid,
            '-',
            new Date().getTime().toString()
          );
          const file = new File([imageBlob], fileName);
          const resp = await uploadImage(file);
          const imageData = {
            url: resp.data.result,
            id: fileName,
          };
          setFileListLocal([...fileListLocal, imageData]);
          updateForm(imageData);
          message.success('Image cropped successfully.');
        } catch (e) {
          console.error(e);
          message.error('Error: Failed to crop image.');
        } finally {
          setIsCropping(false);
          setIsUploadingCrop(false);
        }
      }
    });
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

    window.open(src);
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
        <Col lg={6} xs={6} key={`${type}_${file.uid}_fitToWidth`}>
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
        <Col lg={6} xs={6} key={`${type}_${file.uid}_fitToHeight`}>
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

    if (!!file.url && !!file.oldUrl && file.url !== file.oldUrl && onRollback) {
      actionButtons.push(
        <Col lg={6} xs={6} key={`${type}_${file.uid}_fitRollback`}>
          <Tooltip title="Rollback fit">
            <Button
              size="small"
              shape="circle"
              icon={<RollbackOutlined />}
              onClick={() => onRollback(file.oldUrl, formProp as any, index)}
            />
          </Tooltip>
        </Col>
      );
    }

    if (onAssignToMasthead) {
      actionButtons.push(
        <Col lg={6} xs={6} key={`${type}_${file.uid}_assignToMasthead`}>
          <Tooltip title="Assign to Masthead">
            <Button
              size="small"
              shape="circle"
              icon={<FileImageOutlined />}
              onClick={() => onAssignToMasthead(file)}
            />
          </Tooltip>
        </Col>
      );
    }

    if (onAssignToThumbnail) {
      actionButtons.push(
        <Col lg={6} xs={6} key={`${type}_${file.uid}_assignToThumbnail`}>
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
        <Col lg={6} xs={6} key={`${type}_${file.uid}_assignToTag`}>
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

    if (croppable) {
      actionButtons.push(
        <Col lg={6} xs={6} key={`${type}_${file.uid}_crop`}>
          <Tooltip title="Crop">
            <Button
              size="small"
              shape="circle"
              icon={<ScissorOutlined />}
              onClick={() => {
                setCroppingImage(file);
                setIsCropping(true);
              }}
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
    if (
      onOrder ||
      onFitTo ||
      onRollback ||
      onAssignToTag ||
      onAssignToThumbnail ||
      croppable
    ) {
      return (
        <ImageDnD
          type={type}
          key={file.uid}
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
    <div
      className={classNamesFn(classNames, {
        'scroll-x': scrollOverflow,
      })}
    >
      <DndProvider backend={HTML5Backend}>
        <Upload
          id={id}
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
          disabled={disabled}
        >
          {fileListLocal.length >= maxCount ? null : uploadButton}
        </Upload>
      </DndProvider>
      {isCropping && (
        <ImageCrop
          onFinish={onCropFinish}
          onCancel={() => setIsCropping(false)}
          src={croppingImage.url}
          isCropping
          loading={isUploadingCrop}
        />
      )}
    </div>
  );
};

export default ImageUpload;
